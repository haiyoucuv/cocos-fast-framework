import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};

export const unload: BuildPlugin.load = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};

const PACKAGE_NAME = 'custom-publish';

export const configs: BuildPlugin.Configs = {
    'web-mobile': {
        hooks: './hooks',
        doc: 'editor/publish/custom-build-plugin.html',
        options: {
            useZip: {
                label: '使用zip压缩Bundle',
                default: true,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            useJsEncryption: {
                label: '使用JS加密（线上必须启用）',
                default: true,
                render: {
                    ui: 'ui-checkbox',
                }
            },
            uploadDir: {
                label: '上传文件夹',
                description: '要上传到哪个子文件夹',
                default: 'db_games/ccc_game/template3d',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'db_games/ccc_game/template3d',
                    },
                },
                verifyRules: ['required']
            },
            cdnDomain: {
                label: 'cdn域名',
                description: 'cdnDomain',
                default: '//yun.xxx.com.cn',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: '//yun.xxx.com.cn',
                    },
                },
                verifyRules: ['required']
            },
            // endPoint: {
            //     label: 'endPoint',
            //     description: 'endPoint',
            //     default: '',
            //     render: {
            //         ui: 'ui-input',
            //         attributes: {
            //             placeholder: 'region',
            //         },
            //     },
            //     // verifyRules: ['required']
            // },
            region: {
                label: 'region',
                description: 'region',
                default: 'oss-cn-hangzhou',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'region',
                    },
                },
                verifyRules: ['required']
            },
            bucket: {
                label: 'bucket',
                description: 'bucket',
                default: 'xxx',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'bucket',
                    },
                },
                verifyRules: ['required']
            },
            accessKeyId: {
                label: 'accessKeyId',
                description: 'accessKeyId',
                default: '',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        // password: true,
                        placeholder: 'accessKeyId',
                    },
                },
                verifyRules: ['required']
            },
            accessKeySecret: {
                label: 'accessKeySecret',
                description: 'accessKeySecret',
                default: '',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        // password: true,
                        placeholder: 'accessKeySecret',
                    },
                },
                verifyRules: ['required']
            },
        },
    },
};
