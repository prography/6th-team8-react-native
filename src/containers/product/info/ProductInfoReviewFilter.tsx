import * as React from 'react';
import { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import analytics from "@react-native-firebase/analytics";
import { useSelector, useDispatch } from 'react-redux';

import { d, l, BASE_URL, c } from '~/utils/constant';
import TextProductMiddleBar from '~/components/universal/text/product/info/TextProductMiddleBar';
import ReviewCardContainer from '../review/ReviewCardContainer';
import MarginWide from '~/components/universal/margin/MarginWide';
import GenderLoop from '~/components/universal/profile/GenderLoop';
import LineGrayMiddle from '~/components/universal/line/LineGrayMiddle';
import MarginNarrow from '~/components/universal/margin/MarginNarrow';
import MarginMedium from '~/components/universal/margin/MarginMedium';
import { RootState } from '~/store/modules';

const NARROW_MARGIN = d.px * 9;
const TEXT_HEIGHT = d.px * 16;
const TOUCH_AREA = d.px * 40;
const SELECT_CIRCLE_SIZE = 40;

const FilterWrapper = styled.View`
  flex-direction: column;
  align-items: flex-end;
`;

const FilterBox = styled.TouchableOpacity`
  border-width: 1px;
  border-style: solid;
  border-color: ${c.extraLightGray};
  padding: ${NARROW_MARGIN}px;

  background-color: ${(props) =>
    props.showFilter ? 'white' : props.selected === '' ? 'white' : c.mint};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const FilterText = styled.Text`
  font-size: ${d.px * 14}px;
  line-height: ${TEXT_HEIGHT}px;
  color: ${(props) => (props.showFilter ? 'white' : c.black)};
`;
const FilterSelectionText = styled.Text`
  font-family: Jost-Semi;
  font-size: ${d.px * 14}px;
  color: ${c.darkGray};
  line-height: ${SELECT_CIRCLE_SIZE}px;
  width: ${l.tB}px;
`;
const GenderPartnerFilterContainer = styled.View``;
const FilterSelectWrapper = styled.View`
  flex-direction: row;
  margin-left: ${l.mR}px;
`;

const GenderSelectContainer = styled.View`
  flex-direction: row;
  width: ${d.width - l.mR * 2 - l.tB}px;
  justify-content: space-around;
`;
const SelectCircleTouchArea = styled.TouchableOpacity`
  width: ${SELECT_CIRCLE_SIZE}px;
  height: ${SELECT_CIRCLE_SIZE}px;
  justify-content: center;
  align-items: center;
  /* margin-right: ${SELECT_CIRCLE_SIZE}px; */
`;
const SelectCircle = styled.View`
  width: ${SELECT_CIRCLE_SIZE}px;
  height: ${SELECT_CIRCLE_SIZE}px;
  border-radius: 1000px;
  background-color: ${(props) =>
    props.gender === 'WOMAN'
      ? props.womanColor || c.extraLightGray
      : props.gender === 'MAN'
        ? props.manColor || c.extraLightGray
        : c.extraLightGray};
  justify-content: center;
  align-items: center;
  opacity: ${(props) =>
    props.selectedGender === 'NONE'
      ? 0.3
      : props.selectedGender === props.gender
        ? 0.9
        : 0.3};
`;
const GenderText = styled.Text`
  position: absolute;
  font-family: Jost-Semi;
  font-size: ${d.px * 14}px;
  color: ${c.darkGray};
  line-height: ${SELECT_CIRCLE_SIZE}px;
`;
interface Props {
  productId: number;
  reviewArray: any;
  setReviewArray: any;
}

enum GenderEnum {
  NONE = 'NONE',
  man = 'MAN',
  woman = 'WOMAN',
}

enum PartnerEnum {
  NONE = 'NONE',
  man = 'MAN',
  woman = 'WOMAN',
}

const ProductInfoReviewFilter = ({ setReviewArray, productId }: Props) => {
  const [genderParam, setGenderParam] = useState(GenderEnum.NONE);
  const [partnerParam, setPartnerParam] = useState(PartnerEnum.NONE);
  const [showGenderPartnerFilter, setShowGenderPartnerFilter] = useState(false);
  const womanColor = useSelector(
    (state: RootState) => state.join.genderColor.womanColor,
  );
  const manColor = useSelector(
    (state: RootState) => state.join.genderColor.manColor,
  );
  const genderFilterList = [
    {
      genderEnum: GenderEnum.woman,
      genderText: '여성',
    },
    {
      genderEnum: GenderEnum.man,
      genderText: '남성',
    },
    {
      genderEnum: GenderEnum.NONE,
      genderText: '취소',
    },
  ];
  const partnerFilterList = [
    {
      partnerEnum: PartnerEnum.woman,
      partnerText: '여성',
    },
    {
      partnerEnum: PartnerEnum.man,
      partnerText: '남성',
    },
    {
      partnerEnum: PartnerEnum.NONE,
      partnerText: '취소',
    },
  ];
  const _getReviewArray = async () => {
    let url = `${BASE_URL}/reviews/?product=${productId}`;
    if (genderParam !== GenderEnum.NONE) {
      url += `&gender=${genderParam}`;
    }
    if (partnerParam !== PartnerEnum.NONE) {
      url += `&partner=${partnerParam}`;
    }

    try {
      const response = await fetch(url);
      const json = await response.json();
      console.log('🌮 id', productId, '의 review array success!', json.results);
      setReviewArray(json.results);
    } catch (error) {
      console.log('🌮', productId, '의 review array', error);
    }
  };
  useEffect(() => {
    _getReviewArray();
  }, [genderParam, partnerParam]);
  return (
    <>
      <FilterWrapper>
        <FilterBox
          showFilter={showGenderPartnerFilter}
          selected={genderParam === 'NONE' && partnerParam === 'NONE' && ''}
          onPress={() => {
            analytics().logEvent("press_show_gender_partner_filter", { to: !showGenderPartnerFilter });
            setShowGenderPartnerFilter(!showGenderPartnerFilter);
          }}
        >
          <FilterText>성별 & 파트너</FilterText>
          {showGenderPartnerFilter && (
            <GenderLoop
              gender={genderParam}
              partnerGender={partnerParam}
              size={d.px * 15}
            />
          )}
          {!showGenderPartnerFilter ? (
            genderParam !== 'NONE' || partnerParam !== 'NONE' ? (
              <GenderLoop
                gender={genderParam}
                partnerGender={partnerParam}
                size={d.px * 15}
              />
            ) : null
          ) : null}
        </FilterBox>

        {showGenderPartnerFilter && (
          <GenderPartnerFilterContainer>
            <MarginMedium />
            <FilterSelectWrapper>
              <FilterSelectionText>작성자 성별:</FilterSelectionText>

              <GenderSelectContainer>
                {genderFilterList.map((filter, index: number) => {
                  return (
                    <SelectCircleTouchArea
                      key={index}
                      onPress={() => {
                        analytics().logEvent("press_write_gender_select", { to: filter.genderEnum });
                        setGenderParam(filter.genderEnum);
                      }}
                    >
                      <SelectCircle
                        manColor={manColor}
                        womanColor={womanColor}
                        gender={filter.genderEnum}
                        selectedGender={genderParam}
                      />
                      <GenderText>{filter.genderText}</GenderText>
                    </SelectCircleTouchArea>
                  );
                })}
              </GenderSelectContainer>
            </FilterSelectWrapper>
            <MarginMedium />
            <FilterSelectWrapper>
              <FilterSelectionText>파트너 성별:</FilterSelectionText>
              <GenderSelectContainer>
                {partnerFilterList.map((filter, index: number) => {
                  return (
                    <SelectCircleTouchArea
                      key={index + 100}
                      onPress={() => {
                        analytics().logEvent("press_partner_gender_select", { to: filter.partnerEnum });
                        setPartnerParam(filter.partnerEnum);
                      }}
                    >
                      <SelectCircle
                        manColor={manColor}
                        womanColor={womanColor}
                        gender={filter.partnerEnum}
                        selectedGender={partnerParam}
                      />
                      <GenderText>{filter.partnerText}</GenderText>
                    </SelectCircleTouchArea>
                  );
                })}
              </GenderSelectContainer>
            </FilterSelectWrapper>
            <MarginMedium />
          </GenderPartnerFilterContainer>
        )}
        <MarginMedium />
        <LineGrayMiddle />
      </FilterWrapper>
    </>
  );
};

export default ProductInfoReviewFilter;
