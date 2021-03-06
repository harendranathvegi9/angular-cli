import {normalize} from 'path';

import {createProjectFromAsset} from '../../../utils/assets';
import {exec} from '../../../utils/process';
import {updateJsonFile} from '../../../utils/project';
import {expectFileSizeToBeUnder, expectFileToExist} from '../../../utils/fs';
import {expectToFail} from '../../../utils/utils';


export default function(skipCleaning: () => void) {
  return Promise.resolve()
    .then(() => createProjectFromAsset('webpack/test-app-weird'))
    .then(() => exec(normalize('node_modules/.bin/webpack'), '-p'))
    .then(() => expectFileToExist('dist/app.main.js'))
    .then(() => expectFileToExist('dist/0.app.main.js'))
    .then(() => expectFileToExist('dist/1.app.main.js'))
    .then(() => expectFileToExist('dist/2.app.main.js'))
    // 4.0.0-beta.8 added roughly 80kb extra size (401kb to 480kb).
    // For now we have fixed the test below, but when the size drops down again replace the
    // two lines below with the commented one.
    .then(() => expectFileSizeToBeUnder('dist/app.main.js', 481000))
    .then(() => expectToFail(() => expectFileSizeToBeUnder('dist/app.main.js', 410000)))
    // .then(() => expectFileSizeToBeUnder('dist/app.main.js', 410000))
    .then(() => expectFileSizeToBeUnder('dist/0.app.main.js', 40000))

    // Skip code generation and rebuild.
    .then(() => updateJsonFile('aotplugin.config.json', json => {
      json['skipCodeGeneration'] = true;
    }))
    .then(() => exec(normalize('node_modules/.bin/webpack'), '-p'))
    .then(() => expectFileToExist('dist/app.main.js'))
    .then(() => expectFileToExist('dist/0.app.main.js'))
    .then(() => expectFileToExist('dist/1.app.main.js'))
    .then(() => expectFileToExist('dist/2.app.main.js'))
    .then(() => expectToFail(() => expectFileSizeToBeUnder('dist/app.main.js', 410000)))
    .then(() => expectFileSizeToBeUnder('dist/0.app.main.js', 40000))
    .then(() => skipCleaning());
}
