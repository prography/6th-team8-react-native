import * as React from 'react';
import styled from 'styled-components/native';
import { d, c } from '~/utils/constant';

interface Props {
  productName: string;
}

const TextStyle = styled.Text`
  font-family: 'Jost-Semi';
  line-height: ${d.px * 23}px;
  font-size: ${d.px * 15}px;
  text-align: left;
  color: ${c.black};
`;

const TextProductName = ({ productName }: Props) => {
  return <TextStyle>{productName}</TextStyle>;
};

export default TextProductName;
