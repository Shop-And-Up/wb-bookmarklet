<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';

  import Step1 from './Step1.vue';
  import Step2 from './Step2.vue';
  import Step3 from './Step3.vue';
  import StepNoReviews from './StepNoReviews.vue';
  import Store, { BmState, STEP, SITE_TYPE } from '../../services/store';

  import CloseIcon from '../../assets/icons/close.svg';
  import LogoSVG from '../../assets/icons/logo.svg';
  import LoadingSVG from '../../assets/icons/loading.svg';

  const props = defineProps({ uuid: { type: String, required: true } });
  const showModal = ref(false);

  onMounted(() => {
    Store.setUUID(props.uuid);
    showModal.value = true;

    console.log('WBA - Bookmarklet - ' + import.meta.env.VITE_BOOKMARKLET_VERSION);

    const siteType = getSiteType();
    const tmpStep = siteType != SITE_TYPE.Unknown ? STEP.FORM : STEP.ERROR;
    Store.setSiteType(siteType);
    Store.changeStep(tmpStep);

    function getSiteType() {
      let hostPath = window.location.toString();

      // Dev mod
      // hostPath = 'https://www.amazon.ca/Dolce-Vita-Womens-Bootie-numeric_8_point_5/dp/B08DC974FR/r';
      // return SITE_TYPE.AliExpressV1;
      // return SITE_TYPE.Etsy;

      const rExp: RegExp = /aliexpress\.[^\/]+\/([^\/]+)\/([^\.]+)/;
      let result = rExp.exec(hostPath);

      if (result) {
        if (result[1] == 'item') {
          const tmpProductdetail = document.getElementById('product-detail');
          if (tmpProductdetail) {
            tmpProductdetail.scrollIntoView();
            (document.querySelector("li[ae_button_type='tab_feedback']") as HTMLElement).click();
            return SITE_TYPE.AliExpressV1;
          }
        }

        if (result[1] == 'i') {
          const tmpProductdetail = document.getElementById('extend_tab_feedback');
          if (tmpProductdetail) {
            tmpProductdetail.scrollIntoView();
            tmpProductdetail.click();
            return SITE_TYPE.AliExpressV1;
          }
        }

        return SITE_TYPE.AliExpressV2;
      }

      // if (hostPath.includes('/item/')) {
      //   document.getElementById('product-detail')!.scrollIntoView();
      //   (document.querySelector("li[ae_button_type='tab_feedback']") as HTMLElement).click();
      //   return 1;
      // }

      // if (hostPath.includes('/i/')) {
      //   const feedbackTab = document.getElementById('extend_tab_feedback');
      //   if (feedbackTab) {
      //     feedbackTab.scrollIntoView();
      //     feedbackTab.click();
      //     return 1;
      //   }
      // }

      if (
        hostPath.includes('amazon.') &&
        (hostPath.includes('/dp/') || hostPath.includes('/gp/product/'))
      ) {
        return SITE_TYPE.Amazon;
      }

      if (hostPath.includes('etsy') && hostPath.includes('/listing/')) {
        // Fix font size for Etsy site
        let htmlRoot: HTMLElement = <HTMLElement>document.getElementsByTagName('html')[0];
        if (htmlRoot != null) {
          htmlRoot.style.fontSize = '100%';
        }

        return SITE_TYPE.Etsy;
      }

      return SITE_TYPE.Unknown;
    }
  });

  const crispURL = computed(() => {
    let url = 'https://go.crisp.chat/chat/embed/';
    url += '?website_id=' + import.meta.env.VITE_SCRISP_ID;
    url += '&user_email=' + BmState.shop.email;
    url += '&user_nickname=' + BmState.shop.shop_owner;

    return url;
  });

  const closeModal = () => {
    showModal.value = false;
  };
</script>

<template>
  <div>
    <div class="wba-bm" v-if="showModal">
      <div class="wba-bm-wrapper">
        <div
          class="wba-bm-content"
          role="dialog"
          ref="modal"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <a class="wba-bm-close-btn" @click="closeModal">
            <CloseIcon />
          </a>

          <div class="wba-bm-header">
            <LogoSVG></LogoSVG>
          </div>

          <div v-show="BmState.step == STEP.LOADING">
            <LoadingSVG class="wba-spin-icon-frame"></LoadingSVG>
          </div>

          <div v-show="BmState.step == STEP.ERROR">
            <p class="wba-cs-text-frame">
              Please browse to <strong>Amazon</strong>, <strong>Etsy</strong> or
              <strong>AliExpress</strong> product page.
              <br />
              If you have any problem, feel free to contact our support team via
              <a target="_blank" :href="crispURL"> live chat </a>
            </p>
          </div>

          <Step1 v-show="BmState.step == STEP.FORM"></Step1>

          <Step2 v-if="BmState.step == STEP.RESULT"></Step2>

          <Step3 v-if="BmState.step == STEP.DONE"></Step3>

          <StepNoReviews v-if="BmState.step == STEP.NO_REVIEWS"></StepNoReviews>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
  // Use bootstrap form
  @import '../../assets/prelight.less';
  @import '../../assets/bootstrap-form.less';
  @import '../../assets/popup.less';

  .wba-bm {
    font-family: Inter, sans-serif;
    font-size: 15px;
    font-weight: 400;
    z-index: 9999;
    @apply fixed inset-0 overflow-y-auto bg-black bg-opacity-50;

    &-wrapper {
      @apply flex items-start justify-center pt-96px text-center;

      .wba-bm-content {
        @apply flex flex-col relative bg-white rounded-lg text-left overflow-hidden shadow-xl p-16px w-600px;

        .wba-spin-icon-frame {
          @apply fill-gray-300 w-40px h-40px w-full mt-40px mb-20px mx-auto;
          -webkit-animation: spin 1s linear infinite;
          animation: spin 1s linear infinite;
        }

        .wba-cs-text-frame {
          @apply text-13px mt-20px mb-10px mx-auto text-gray-600 leading-25px max-w-500px w-full text-center;

          a {
            @apply text-blue-600;
          }
        }
      }

      .wba-bm-close-btn {
        @apply absolute top-12px right-12px cursor-pointer;

        svg {
          width: 24px;
          height: 24px;
          @apply fill-gray-500;
        }
      }

      .wba-bm-header {
        @apply flex justify-center items-center !mt-0;
        svg {
          width: 64px;
          height: 64px;
        }
      }

      .wba-group-btn {
        @apply flex items-center justify-around w-full;
      }

      .btn {
        @apply flex items-center justify-around;

        svg {
          width: 16px;
          height: 16px;

          &.wba-spin-icon {
            -webkit-animation: spin 1s linear infinite;
            animation: spin 1s linear infinite;
          }
        }
      }
    }

    // Spining
    @keyframes spin {
      from {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      to {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @-webkit-keyframes spin {
      from {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      to {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    // Tooltip
    --popper-theme-background-color: #6b6b6b;
    --popper-theme-background-color-hover: #333333;
    --popper-theme-text-color: #ffffff;
    --popper-theme-border-width: 0px;
    --popper-theme-border-style: solid;
    --popper-theme-border-radius: 3px;
    --popper-theme-padding: 8px;
    --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);

    // Multiple selcted
    --ms-option-bg-selected-pointed: #0d6efd;
    --ms-option-bg-selected: #0d6efd;
    --ms-tag-bg: #0d6efd;
    --ms-tag-font-size: 14px;
    --ms-tag-font-weight: 400;

    .character-option-icon {
      margin: 0 6px 0 0;
      height: 22px;
      @apply rounded-sm;
    }
    .character-label-icon {
      margin: 0 6px 0 0;
      height: 26px;
      @apply rounded-sm;
    }
  }
</style>
