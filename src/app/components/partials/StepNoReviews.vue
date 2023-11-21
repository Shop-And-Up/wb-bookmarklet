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
</script>

<template>
  <div class="wba-bm-result">
    <p class="wba-cs-text">
      Sorry! We found <span class="no-items"> 0 review </span> with your filter. Please try again
      with another filter or if you have any problem, feel free to contact our support team via
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
    </div>
  </div>
</template>

<style lang="less" scoped>
  .wba-bm-result {
    @apply flex flex-col justify-center items-center space-y-8px;

    .no-items {
      @apply font-bold text-15px;
    }
    .wba-cs-text {
      @apply text-13px text-gray-600 leading-25px w-full text-center !my-50px;

      a {
        @apply text-blue-600;
      }
    }
  }
</style>
