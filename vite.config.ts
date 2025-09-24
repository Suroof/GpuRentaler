import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const isProduction = mode === 'production';

	return {
		base: './',

		// 路径解析
		resolve: {
			alias: {
				'@': resolve(__dirname, 'src'),
				'@components': resolve(__dirname, 'src/components'),
				'@views': resolve(__dirname, 'src/views'),
				'@utils': resolve(__dirname, 'src/utils'),
				'@api': resolve(__dirname, 'src/api'),
				'@store': resolve(__dirname, 'src/store'),
				'@assets': resolve(__dirname, 'src/assets')
			}
		},

		// 插件配置
		plugins: [
			vue(),
			VueSetupExtend(),
			AutoImport({
				imports: [
					'vue',
					'vue-router',
					'pinia',
					{
						'element-plus': [
							'ElMessage',
							'ElMessageBox',
							'ElNotification',
							'ElLoading'
						]
					}
				],
				resolvers: [ElementPlusResolver()],
				dts: true,
				eslintrc: {
					enabled: true
				}
			}),
			Components({
				resolvers: [ElementPlusResolver({
					importStyle: 'sass'
				})],
				dts: true
			})
		],

		// 开发服务器配置
		server: {
			host: '0.0.0.0',
			port: 3000,
			open: true,
			cors: true,
			proxy: {
				'/admin3': {
					target: 'http://localhost:8080',
					changeOrigin: true,
					secure: false
				}
			}
		},

		// 预览服务器配置
		preview: {
			port: 4173,
			host: '0.0.0.0'
		},

		// CSS配置
		css: {
			postcss: {
				plugins: []
			}
		},

		// 依赖优化
		optimizeDeps: {
			include: [
				'vue',
				'vue-router',
				'pinia',
				'element-plus/es',
				'element-plus/es/components/message/style/css',
				'element-plus/es/components/notification/style/css',
				'element-plus/es/components/message-box/style/css',
				'@element-plus/icons-vue',
				'axios',
				'echarts/core',
				'echarts/charts',
				'echarts/components',
				'echarts/renderers',
				'vue-echarts',
				'lodash-es'
			],
			exclude: ['schart.js']
		},

		// 构建配置
		build: {
			target: 'es2015',
			cssTarget: 'chrome80',
			outDir: 'dist',
			assetsDir: 'assets',
			sourcemap: !isProduction,

			// 消除打包大小超过限制的警告
			chunkSizeWarningLimit: 2000,

			// 资源内联阈值
			assetsInlineLimit: 4096,

			// Rollup配置
			rollupOptions: {
				input: {
					main: resolve(__dirname, 'index.html')
				},
				output: {
					// 静态资源分类打包
					chunkFileNames: 'assets/js/[name]-[hash].js',
					entryFileNames: 'assets/js/[name]-[hash].js',
					assetFileNames: (assetInfo) => {
						const info = assetInfo.name.split('.');
						const extType = info[info.length - 1];

						if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
							return `assets/media/[name]-[hash][extname]`;
						}
						if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
							return `assets/images/[name]-[hash][extname]`;
						}
						if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
							return `assets/fonts/[name]-[hash][extname]`;
						}
						if (/\.(css)(\?.*)?$/i.test(assetInfo.name)) {
							return `assets/css/[name]-[hash][extname]`;
						}
						return `assets/[ext]/[name]-[hash][extname]`;
					},

					// 代码分割
					manualChunks: {
						// Vue生态
						vue: ['vue', 'vue-router', 'pinia'],

						// Element Plus
						'element-plus': ['element-plus', '@element-plus/icons-vue'],

						// 图表库
						echarts: ['echarts', 'vue-echarts'],

						// 工具库
						utils: ['axios', 'lodash'],

						// 编辑器
						editor: ['md-editor-v3', 'wangeditor'],

						// 其他第三方库
						vendor: ['vue-cropperjs', 'vue-schart', 'xlsx']
					}
				},

				// 外部化依赖（CDN模式）
				external: isProduction ? [] : []
			},

			// 生产环境优化
			minify: isProduction ? 'terser' : false,
			terserOptions: isProduction ? {
				compress: {
					drop_console: true,
					drop_debugger: true,
					pure_funcs: ['console.log']
				},
				format: {
					comments: false
				}
			} : undefined
		},

		// 全局常量定义
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString())
		},

		// ESBuild配置
		esbuild: {
			target: 'es2020',
			drop: isProduction ? ['console', 'debugger'] : []
		}
	};
});
