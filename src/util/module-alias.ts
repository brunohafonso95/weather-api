import moduleAlias from 'module-alias';
import path from 'path';

const files = path.resolve(__dirname, '..', '..');

moduleAlias.addAliases({
  '@src': path.join(files, 'src'),
  '@tests': path.join(files, '__tests__'),
});
