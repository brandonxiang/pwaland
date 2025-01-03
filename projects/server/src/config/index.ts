/* eslint-disable @typescript-eslint/no-var-requires */
import _ from 'lodash';
import { Config } from '../types/config';

const { APP_REGION = 'sg', APP_ENV = 'dev' } = process.env;
console.log('APP_REGION', APP_REGION);
console.log('APP_ENV', APP_ENV);

const defaultConfig = import(`./${APP_REGION}/default`).then(module => module.default);
let destConfig: Config | null = null;

export const getConfig = (): Config => {
  if (destConfig) {
    return destConfig;
  }
  if (APP_ENV === 'pretest') {
    const testConfig = import(`./${APP_REGION}/pretest`).then(module => module.default);
    destConfig = _.defaultsDeep(testConfig, defaultConfig);
  } else if (APP_ENV === 'test') {
    const testConfig = import(`./${APP_REGION}/test`).then(module => module.default);
    destConfig = _.defaultsDeep(testConfig, defaultConfig);
  } else if (APP_ENV === 'staging') {
    const stagingConfig = import(`./${APP_REGION}/staging`).then(module => module.default);
    destConfig = _.defaultsDeep(stagingConfig, defaultConfig);
  } else if (APP_ENV === 'uat') {
    const uatConfig = import(`./${APP_REGION}/uat`).then(module => module.default);
    destConfig = _.defaultsDeep(uatConfig, defaultConfig);
  } else if (APP_ENV === 'live') {
    const liveConfig = import(`./${APP_REGION}/live`).then(module => module.default);
    destConfig = _.defaultsDeep(liveConfig, defaultConfig);
  }

  console.log('CONFIG => ', destConfig || defaultConfig);
  return destConfig || defaultConfig;
};
export default {};
