import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import * as baggageActions from "../../store/modules/baggage";
import MainTemplate from "../../components/main/MainTemplate";
import Header from "../../components/main/Header";
import BaggageList from "../../components/main/BaggageList";
import Carrier from "../../components/main/Carrier";

class MainContainer extends Component {
  state = {
    beforeList: [],
    carrier: [],
    afterList: [],
    time: 0
  };

  
  makeInitializedArray = (length, value) =>
    Array.apply(null, new Array(length)).map(Number.prototype.valueOf, value);

  isInputableToCarrier = (carrier = [], input = 0) =>
    this.getArraySum(carrier) + input <= this.props.maxWeight;

  getArraySum = (arr = []) => arr.reduce((acc, cur) => acc + cur, 0);

  isListEmpty = (arr = []) => arr.length === 0;

  copyArray = (arr = []) => arr.map(e => e);

  isTerminated = (arr = [], emptyArr = []) =>
    this.isListEmpty(emptyArr) &&
    this.isInputableToCarrier(arr, Number(this.props.maxWeight));

  handleCarrier = () => {
    const { beforeList, carrier, afterList, time } = this.state;
    //배열 연산을 위해 복사본 생성;
    const newBeforeList=this.copyArray(beforeList);
    const newCarrier=this.copyArray(carrier);
    const newAfterList=this.copyArray(afterList);
    const newTime=time+1;

    //before 배열에서 하나의 요소를 빼옴
    const beforeTemp = newBeforeList.shift() || 0;
    //carrier 배열에서 하나의 요소를 빼옴
    const carrierTemp = newCarrier.shift() || 0;

    //carrier의 요소가 0이 아니면 after배열에 삽입
    if (carrierTemp !== 0) {
      newAfterList.push(carrierTemp);
    }

    //before 배열에서 빼온 요소를 carrier요소에 삽입가능하면 삽입
    //삽입 불가능하면 before배열에 다시 돌려놓는다.
    if (this.isInputableToCarrier(newCarrier, beforeTemp)) {
      newCarrier.push(beforeTemp);
    } else {
      newCarrier.push(0);
      newBeforeList.unshift(beforeTemp);
    }

    this.setState({
      carrier: newCarrier,
      beforeList: newBeforeList,
      afterList: newAfterList,
      time: newTime,
    });

    if (!this.isTerminated(carrier, beforeList)) {
      setTimeout(this.handleCarrier, 1000);
    }
  };

  start = () => {
    this.setState({
      carrier: this.makeInitializedArray(this.props.lineLength, 0),
      beforeList: this.copyArray(this.props.baggageList),
      afterList: [],
      time: 0
    });
    setTimeout(this.handleCarrier, 1000);
  };

  render() {
    const { lineLength, maxWeight, baggageList } = this.props;
    const { beforeList, carrier, afterList, time } = this.state;

    return (
      <MainTemplate>
        <Header
          length={lineLength}
          weight={maxWeight}
          list={baggageList.join(",")}
          onClick={this.start}
          disabled={!this.isTerminated(carrier, beforeList)}
        />
        <BaggageList list={beforeList} group="before" />
        <Carrier
          list={carrier}
          weight={this.getArraySum(carrier)}
          time={time}
          group="carrier"
        />
        <BaggageList list={afterList} group="after" />
      </MainTemplate>
    );
  }
}

export default connect(
  state => ({
    lineLength: state.baggage.lineLength,
    maxWeight: state.baggage.maxWeight,
    baggageList: state.baggage.baggageList
  }),
  dispatch => ({
    BaggageActions: bindActionCreators(baggageActions, dispatch)
  })
)(withRouter(MainContainer));
