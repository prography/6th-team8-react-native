import * as React from "react";
import { Alert } from "react-native";
import styled from "styled-components/native";
import { fetchAPI } from "~/api";
import { SutraReview } from "~/api/interface";
import { Img } from "~/img";
import { getTokenItem } from "~/utils/asyncStorage";
import { c, d, dateCutter, l } from "~/utils/constant";
import { consoleError, llog } from "~/utils/functions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
interface Props {
  pressReport: () => void;
}

const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: ${d.px * 10}px;
  padding: ${d.px * 2}px ${d.px * 3}px;
`;

const ReportText = styled.Text`
  font-family: Jost-Book;
  font-size: ${d.px * 15}px;
  line-height: ${d.px * 23}px;
  color: ${c.black};
`;

const SutraInfoReviewReport = ({ pressReport }: Props) => {

  return (
    <Container onPress={pressReport} activeOpacity={1}>
      <MaterialCommunityIcons
        name={"alarm-light-outline"}
        color={c.red}
        size={17}
      />
    </Container>
  );
};

export default SutraInfoReviewReport;
