<script lang="ts" setup>
  import { computed } from 'vue';
  import Store, { BmState, STEP } from '../../services/store';

  const crispURL = computed(() => {
    let url = 'https://go.crisp.chat/chat/embed/';
    url += '?website_id=' + import.meta.env.VITE_SCRISP_ID;
    url += '&user_email=' + BmState.shop.email;
    url += '&user_nickname=' + BmState.shop.shop_owner;

    return url;
  });

  const redirectToApp = () => {
    window.open(import.meta.env.VITE_FRONTEND_URL + '/products', '_blank');
  };

  const redirectProductPage = () => {
    window.open(BmState.product.url, '_blank');
  };
</script>

<template>
  <div class="wba-bm-result">
    <p class="wba-cs-text">
      Congratulation! Your all reviews have been published. If you have any problem, feel free to
      contact our support team via
      <a target="_blank" :href="crispURL"> live chat </a>
    </p>

    <div class="wba-group-btn">
      <button
        style="width: 150px"
        class="btn btn-outline-secondary btn-sm"
        @click="Store.changeStep(STEP.FORM)"
      >
        Back
      </button>
      <button
        style="width: 150px"
        class="btn btn-outline-secondary btn-sm"
        @click="redirectProductPage"
      >
        Product page
      </button>
      <button style="width: 150px" class="btn btn-outline-secondary btn-sm" @click="redirectToApp">
        Go to App
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .wba-bm-result {
    @apply flex flex-col justify-center items-center space-y-8px;

    // Done step
    .wba-cs-text {
      @apply text-12px text-gray-600 leading-20px max-w-500px text-center !my-50px;

      a {
        @apply text-blue-600;
      }
    }
  }
</style>
