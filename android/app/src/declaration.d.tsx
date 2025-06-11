declare module 'react-native-html-to-pdf';
declare module '*.png' {
  const content: any;
  export default content;
}

declare module 'react-native-vector-icons/Ionicons' {
  import * as React from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Ionicons extends React.Component<IconProps> {}
}