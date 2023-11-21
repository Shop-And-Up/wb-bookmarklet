import {
  defineCustomElement as VueDefineCustomElement,
  h,
  createApp,
  getCurrentInstance,
} from 'vue';

const getNearestElementParent = (el) => {
  while (el?.nodeType !== 1 /* ELEMENT */) {
    el = el.parentElement;
  }
  return el;
};

const defineCustomElement = (component, plugins: any = []) =>
  VueDefineCustomElement({
    props: component.props,
    setup(props) {
      const app = createApp(component);

      // install plugins
      plugins.forEach(app.use);

      app.mixin({
        mounted() {
          const insertStyles = (styles) => {
            if (styles?.length) {
              this.__style = document.createElement('style');
              this.__style.innerText = styles.join().replace(/\n/g, '');
              getNearestElementParent(this.$el).prepend(this.__style);
            }
          };

          // load own styles
          insertStyles(this.$?.type.styles);

          // load styles of child components
          if (this.$options.components) {
            for (const comp of Object.values<any>(this.$options.components)) {
              insertStyles(comp.styles);
            }
          }
        },
        unmounted() {
          this.__style?.remove();
        },
      });

      const inst = getCurrentInstance();
      Object.assign(inst!.appContext, app._context);
      // Object.assign(inst!.provides, app._context.provides);

      return () => h(component, props);
    },
  });

import Bookmarklet from './components/BookmarkCE.vue';
customElements.define('wba-bookmarklet', defineCustomElement(Bookmarklet));
