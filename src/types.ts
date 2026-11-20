export interface TypefaceAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit?: string;
  description: string;
}

export interface TypefaceFamily {
  id: string;
  name: string;
  year: string;
  personality: string;
  fontFamily: string;
  tagline: string;
  description: string;
  heroSpecimen: string;
  axes: TypefaceAxis[];
  samplePangram: string;
  applications: string[];
}

export interface GlyphMetric {
  char: string;
  name: string;
  unicode: string;
  category: 'uppercase' | 'lowercase' | 'numeral' | 'symbol';
  advanceWidth: number;
  leftBearing: number;
  rightBearing: number;
  ascender: number;
  capHeight: number;
  xHeight: number;
  baseline: number;
  descender: number;
}
