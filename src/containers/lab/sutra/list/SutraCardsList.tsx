import * as React from "react";
import styled from 'styled-components/native';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import OneSutraCard from "~/components/lab/sutra/list/OneSutraCard";
import { getTokenItem } from "~/utils/asyncStorage";
import { fetchAPI } from "~/api";
import { llog, consoleError } from "~/utils/functions";
import { ResultsRes, Sutra, RecommendType, Position } from "~/api/interface";
import MarginMedium from "~/components/universal/margin/MarginMedium";
import { alertUtil } from "~/utils/alert";

import LineGrayMiddle from "~/components/universal/line/LineGrayMiddle";

import { toast } from "~/utils/toast";
import { RootState } from "~/store/modules";


interface Props {
  navigateToJoinStack: () => void;
  openQuestionModal: () => void;
  position: Position;
  navigateSutraInfo: (id: number) => void;
}
const NARROW_MARGIN = 9;
const TEXT_HEIGHT = 16;
// [x] 여기에서 데이터 받아와서 map 돌려서 OneSutraCard에 넘겨주면 됩니다!

// [ ] TempContainer 대신 필터 디자인
const TempContainer = styled.View`
  flex-direction: row;
  margin-bottom: 5px; /* 대충대충~ㅋㅋ */
  align-self: center;
`;
const TempBtn = styled.TouchableOpacity`
  width: 55px;
  height: 35px;
  background-color: ${({ selected }: { selected: boolean }) => selected ? 'lightblue' : '#e6faf9'};
  margin-right: 5px;
  justify-content: center;
  align-items: center;
`;
const TempBtnText = styled.Text`
  font-size: 11px;
  align-self: center;
  margin-bottom: 10px;
`;
// filter style
const FilterButtonContainer = styled.View`
  flex-direction: row;
  height: ${ props => props.theme.dimensions.px * 60}px;
  justify-content: flex-end;
  align-items: center;
`

const FilterWrapper = styled.View`
  padding: 0 ${props => props.theme.paddingWidth.wideLeftRight.paddingLeft};
  flex-direction: row;
  justify-content: flex-end;
`;

const FilterBox = styled.TouchableOpacity`
  height: ${props => props.theme.dimensions.px * 30}px;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => props.theme.themeColor.extraLightGray};
  padding: 0 ${NARROW_MARGIN}px;
  background-color: ${(props) =>
    props.showOrderFilter
      ? props.theme.themeColor.purple
      : props.selectedOrder === props.notSelectedEnum
        ? 'white'
        : props.theme.themeColor.mint};
`;

const FilterText = styled.Text`
  ${props => props.theme.fonts.button.filter};
  color: ${(props) => (props.showOrderFilter ? 'white' : props.theme.themeColor.black)};
`;
const OrderFilterWrapper = styled.View`
  padding: 0 ${props => props.theme.paddingWidth.wideLeftRight.paddingLeft};
`;
const OrderFilterBox = styled.TouchableOpacity`
  width: 100%;
height: ${ props => props.theme.dimensions.px * 55}px;
align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;
const OrderFilterText = styled.Text`
  font-size: ${props => props.theme.dimensions.px * 14}px;
  line-height: ${TEXT_HEIGHT}px;
  font-family: ${(props) =>
    props.orderEnum === props.selectedOrder ? 'Jost-Medium' : 'Jost-Light'};
  color: ${(props) =>
    props.orderEnum === props.selectedOrder ? props.theme.themeColor.black : props.theme.themeColor.lightGray};
`;
const SelectedCircle = styled.View`
  width: ${TEXT_HEIGHT / 2}px;
  height: ${TEXT_HEIGHT / 2}px;
  background-color: ${props => props.theme.themeColor.purple};
  border-radius: 1000px;
`;
/* enum */
enum FilterEnum {
  none = 'none',
  recommend = 'recommend',
  unrecommend = 'unrecommend',
  notyet = 'notyet',
  like = 'like',
}
enum OrderEnum {
  none = 'none',
  default = 'default', // 이게 url로 쓰이진 않음
  evaluation = 'evaluation',
  recommend = 'recommend',
  unrecommend = 'unrecommend',
  notyet = 'notyet',
  like = 'like',
}
interface Filter {
  enum: FilterEnum;
  text: string;
}
interface Order {
  enum: OrderEnum;
  text: string;
}
const filters: Filter[] = [
  { enum: FilterEnum.none, text: '선택 취소' },
  { enum: FilterEnum.recommend, text: '내가 추천한' },
  { enum: FilterEnum.unrecommend, text: '내가 비추천한' },
  { enum: FilterEnum.notyet, text: '안해봤어요' },
  { enum: FilterEnum.like, text: '찜 리스트' },
];
const orders: Order[] = [
  { enum: OrderEnum.default, text: '최신순' }, // order 아예 설정 안하면 얘가 디폴트임. 
  { enum: OrderEnum.evaluation, text: '평가개수순' },
  { enum: OrderEnum.recommend, text: '추천순' },
  { enum: OrderEnum.unrecommend, text: '비추천순' },
  { enum: OrderEnum.notyet, text: '안해봤어요순' },
  { enum: OrderEnum.like, text: '찜순' },
];
// API DOCS: http://snowflakeproduction-env.eba-qnph52vm.ap-northeast-2.elasticbeanstalk.com/swagger/
// order => default: 최신순 | 평가개수순: evaluation | 추천순: recommend | 비추천순: unrecommend | 안해봤어요 순: notyet | 찜순: like
// filter => 추천: recommend | 비추천: unrecommend | 안해봤어요: notyet | 찜: like

const SutraCardsList = ({ navigateToJoinStack, openQuestionModal, position, navigateSutraInfo }: Props) => {
  /* 1. Sutra List */
  const [_sutraCardsList, _setSutraCardsList] = useState<Sutra[]>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterEnum>(FilterEnum.none);

  const [selectedOrder, setSelectedOrder] = useState<OrderEnum>(OrderEnum.default);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showOrderFilter, setShowOrderFilter] = useState<boolean>(false)

  // redux
  const isLoggedin = useSelector((state: RootState) => state.join.auth.isLoggedin);

  const _getSutraList = async () => {
    try {
      const token = await getTokenItem();

      let url = `labs/sutras?`;
      if (selectedFilter !== FilterEnum.none) {
        url += `filter=${selectedFilter}&`;
      }
      if (selectedOrder !== OrderEnum.none && selectedOrder !== OrderEnum.default) {
        url += `order=${selectedOrder}&`;
      }

      // url의 끝에 ?나 &가 있으면
      if (url[url.length - 1] === '&' || url[url.length - 1] === '?') {
        url = url.substring(0, url.length - 1);
      }
      llog('🍎 url', url);

      const { status, response } = await fetchAPI(`${url}/`, { token });
      const json: ResultsRes<Sutra> = await response.json();
      llog("SutraList", status, json);

      if (status === 200) {
        _setSutraCardsList(json.results);
      }
    } catch (error) {
      consoleError("SutraList - error", error);
    }
  };

  /* 2. 추천, 비추천, 안해봤어요, 찜 */
  // 추천, 비추천, 안해봤어요
  const onPressEvaluation = async (sutraId: number, rcType: RecommendType) => {
    try {
      const token = await getTokenItem();
      if (!token) {
        alertUtil.needLogin(navigateToJoinStack, '로그인');
        return;
      }

      if (position === Position.NONE) {
        openQuestionModal();
        return;
      }

      const { status, response } = await fetchAPI(`labs/sutras/${sutraId}/evaluations/`, { method: 'POST', token, params: { recommend_type: rcType } });
      const json = await response.json();
      llog('🐰 Sutra', rcType, status, json);

      if (status === 201) {
        _getSutraList();
      } else {
        toast(`처리 중 오류가 발생했어요. (${status})`);
      }
    } catch (error) {
      consoleError(`SutraList - ${rcType} error`, error);
    }
  };
  // 평가 삭제
  const onPressDeleteEvaluation = async (sutraId: number) => {
    try {
      const token = await getTokenItem();
      if (!token) {
        alertUtil.needLogin(navigateToJoinStack, '로그인');
        return;
      }

      const { status, response } = await fetchAPI(`labs/sutras/${sutraId}/evaluations/`, {
        method: 'DELETE',
        token,
      });

      if (status === 204) {
        _getSutraList();
      } else {
        toast(`처리 중 오류가 발생했어요. (${response.status})`);
      }
    } catch (error) {
      consoleError('SutraList - delete 평가 error', error);
    }
  }
  // 찜 or 찜 삭제
  const onPressLikeOrDeleteLike = async (action: 'like' | 'deleteLike', sutraId: number) => {
    try {
      const token = await getTokenItem();
      if (!token) {
        alertUtil.needLogin(navigateToJoinStack, '로그인');
        return;
      }

      const { status } = await fetchAPI('likes/', {
        method: action === 'like' ? 'POST' : 'DELETE',
        token,
        params: {
          model: 'sutra',
          object_id: sutraId,
        },
      });
      // NOP!!! const json = await response.json(); // 204 일 때 .json() 하면 서버쪽에서 보내주는게 없어서 에러남
      llog('🐰 Sutra Like or DeleteLike', status, sutraId);

      if (action === 'like' && status === 201) {
        _getSutraList();
      } else if (action === 'deleteLike' && status === 204) {
        _getSutraList();
      } else {
        toast('오류가 발생했어요');
      }
    } catch (error) {
      consoleError(`SutraList - ${action === 'like' ? '찜' : '찜 삭제'}  error`, error);
    }
  };

  useEffect(() => {
    _getSutraList();
    // TODO _getSutraList n초 단위로 새로고침
  }, [selectedFilter, selectedOrder, isLoggedin]);


  return (
    <>
      <LineGrayMiddle />
      <FilterButtonContainer>
        <FilterWrapper>
          <FilterBox
            notSelectedEnum={FilterEnum.none}
            selectedOrder={selectedFilter}
            showOrderFilter={showFilter}
            onPress={() => setShowFilter(!showFilter)}
          >
            <FilterText showOrderFilter={showFilter}>{selectedFilter === FilterEnum.none ? '모아보기' : selectedFilter}</FilterText>
          </FilterBox>
        </FilterWrapper>
        <FilterWrapper>
          <FilterBox
            notSelectedEnum={OrderEnum.default}
            selectedOrder={selectedOrder}
            showOrderFilter={showOrderFilter}
            onPress={() => setShowOrderFilter(!showOrderFilter)}
          >
            <FilterText showOrderFilter={showOrderFilter}>{selectedOrder === OrderEnum.default ? '최신순' : selectedOrder}</FilterText>
          </FilterBox>
        </FilterWrapper>

      </FilterButtonContainer>
      <LineGrayMiddle />
      {showFilter &&
        <>
          <OrderFilterWrapper>
            {filters.map((f: Filter, index: number) => {
              return (
                <OrderFilterBox
                  key={index}
                  onPress={() => [setSelectedFilter(f.enum), setShowFilter(!showFilter)]}>
                  <OrderFilterText
                    selectedOrder={selectedFilter}
                    orderEnum={f.enum}
                  >
                    {f.text}
                  </OrderFilterText>
                  {selectedFilter === f.enum && <SelectedCircle />}
                </OrderFilterBox>
              );
            })}
          </OrderFilterWrapper>
          <LineGrayMiddle />
        </>
      }

      {showOrderFilter &&
        <>
          <OrderFilterWrapper>
            {orders.map((o: Order, index: number) => {
              return (
                <OrderFilterBox
                  key={index}
                  onPress={() => [setSelectedOrder(o.enum), setShowOrderFilter(!showOrderFilter)]}>
                  <OrderFilterText
                    selectedOrder={selectedOrder}
                    orderEnum={o.enum}
                  >
                    {o.text}
                  </OrderFilterText>
                  {selectedOrder === o.enum && <SelectedCircle />}
                </OrderFilterBox>
              );
            })}
          </OrderFilterWrapper>
          <LineGrayMiddle />
        </>
      }
      <MarginMedium />
      {_sutraCardsList?.map((sutra: Sutra) => (
        <OneSutraCard
          key={sutra.id}
          sutra={sutra}
          navigateSutraInfo={() => navigateSutraInfo(sutra.id)}
          onPressEvaluation={onPressEvaluation}
          onPressDeleteEvaluation={onPressDeleteEvaluation}
          onPressLikeOrDeleteLike={onPressLikeOrDeleteLike}
        />
      ))}
    </>
  );
};

export default SutraCardsList;
