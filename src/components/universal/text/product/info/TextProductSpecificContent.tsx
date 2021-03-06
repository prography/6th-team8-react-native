import * as React from 'react';
import styled from 'styled-components/native';
import { d, c } from '~/utils/constant';

interface Props {
  category?: string;
  length?: string;
  width?: string;
  thickness?: string;
}

const TextStyle = styled.Text`
  font-family: 'Jost-Book';
  font-size: ${d.px * 13}px;
  line-height: ${d.px * 17}px;
  text-align: left;
  color: ${c.lightGray};
`;

const Container = styled.View``;

const TextProductSpecificContent = ({
  category,
  length,
  width,
  thickness,
}: Props) => {
  return (
    <Container>
      {category && <TextStyle>{category}</TextStyle>}
      {length && <TextStyle>길이 {length}mm</TextStyle>}
      {width && <TextStyle>폭 {width}mm</TextStyle>}
      {thickness && <TextStyle>폭 {thickness}mm</TextStyle>}
    </Container>
  );
};

export default TextProductSpecificContent;
