import postcssTailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: {
    '@tailwindcss/postcss': postcssTailwind,
    autoprefixer,
  },
};
