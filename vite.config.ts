import vue from "@vitejs/plugin-vue";
import * as path from "path";
import {defineConfig} from "vite";
import dts from "vite-plugin-dts";
import svgLoader from 'vite-svg-loader';
import WindiCSS from 'vite-plugin-windicss';

export default defineConfig({
    plugins: [vue({customElement: true}), svgLoader(), WindiCSS(), dts()], build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"), name: "WbaBookmarklet", fileName: "wba-bookmarklet"
        }, rollupOptions: {
            external: ["vue"], output: {
                globals: {
                    vue: "Vue"
                }
            }
        }
    }, resolve: {
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    }
});