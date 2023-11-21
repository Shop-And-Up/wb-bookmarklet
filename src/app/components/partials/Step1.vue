<script lang="ts" setup>
  import { onMounted, reactive, ref, computed } from 'vue';
  import Multiselect from '@vueform/multiselect';
  import Popper from 'vue3-popper';

  import { countries } from './data.ts';
  import { LoadingSVG, HelpIcon } from '../../assets/icons';
  import { getShopAPI, importReviewAPI, searchProductAPI } from '../../services/api';
  import {
    fetchAliExpressV1Reviews,
    genAliExpressV1FeedbackURL,
    fetchAliExpressV2Reviews,
    fetchEtsyReviews,
    genAliExpressV2FeedbackURL,
    genAmazonURL,
    fetchAmazonReviews,
  } from '../../services/helper';
  import Store, { BmState, SITE_TYPE, STEP } from '../../services/store';

  const tooltipSeting: any = {
    arrow: true,
    hover: true,
    placement: 'right',
    openDelay: 200,
    closeDelay: 100,
  };

  const countrySelectEL = {
    mode: 'tags',
    value: ['all'],
    closeOnSelect: false,
    options: countries,
    searchable: true,
  };

  const productSelectEl = {
    placeholder: 'Type to search...',
    filterResults: false,
    minChars: 1,
    resolveOnLoad: true,
    delay: 400,
    searchable: true,
    options: async (query) => {
      return searchProductAPI(BmState.uuid, query).then((res: any) => {
        return res.data.map((item) => {
          return {
            value: item.id,
            label: item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name,
            icon: item.image,
            url: item.url,
          };
        });
      });
    },
  };

  const isLoading = ref(false);
  const formValue = reactive({
    totalFetchedItems: 0,
    shop_domain: null,
    product: null,
    show_country: false,
    countries: ['ALL'],
    quantity: 500,
    maxQuantity: 500,
    rating: 4,
    show_has_media: true,
    hasMedia: false,
    hasNoMedia: false,
    show_translate: false,
    autoTranslate: false,
    autoGenerateName: false,
  });

  onMounted(() => {
    // Init form base on site type
    initFormValue();

    getShopAPI(BmState.uuid).then((res) => {
      Store.setShopInfo(res.data);
      formValue.shop_domain = res.data.domain;

      // Nếu là partner thì cho phép max quantity là 10.000
      if (res.data.partner_id) {
        formValue.maxQuantity = 10000;
      }

      initFormValue();
    });

    // Init form base on site type
    function initFormValue() {
      switch (BmState.site_type) {
        case SITE_TYPE.AliExpressV1:
          formValue.show_translate = true;
          formValue.quantity = 50;
          formValue.autoGenerateName = true;
          formValue.autoTranslate = true;
          formValue.show_country = true;
          break;

        case SITE_TYPE.AliExpressV2:
          formValue.show_translate = true;
          formValue.quantity = 200;
          formValue.autoGenerateName = true;
          formValue.autoTranslate = true;
          formValue.show_country = true;
          break;

        case SITE_TYPE.Etsy:
          formValue.show_has_media = false;
          formValue.quantity = 20;
          break;

        case SITE_TYPE.Amazon:
          if (BmState.shop && BmState.shop.partner_id) {
            formValue.quantity = 5000;
          }
          break;

        default:
          break;
      }
    }
  });

  const handleSubmit = async () => {
    isLoading.value = true;
    formValue.totalFetchedItems = 0;
    if (formValue.quantity > formValue.maxQuantity) {
      formValue.quantity = formValue.maxQuantity;
    }

    // Crawl data
    let rawReviews: any[] = [];
    let reviewUrl: any = null;

    try {
      switch (BmState.site_type) {
        case SITE_TYPE.AliExpressV1:
          reviewUrl = genAliExpressV1FeedbackURL(formValue);
          rawReviews = await fetchAliExpressV1Reviews(formValue, reviewUrl);
          break;

        case SITE_TYPE.AliExpressV2:
          reviewUrl = genAliExpressV2FeedbackURL(formValue);
          rawReviews = await fetchAliExpressV2Reviews(formValue, reviewUrl);
          break;

        case SITE_TYPE.Etsy:
          reviewUrl = window.location.toString();
          rawReviews = await fetchEtsyReviews(formValue);
          break;

        case SITE_TYPE.Amazon:
          reviewUrl = genAmazonURL(formValue);
          rawReviews = await fetchAmazonReviews(formValue, reviewUrl);
          break;

        default:
          // THIS CASE WILL NEVER HAPPEN
          return;
      }
    } catch (error) {}

    Store.updateRawReview(rawReviews);

    if (!rawReviews.length) {
      Store.changeStep(STEP.NO_REVIEWS);
      isLoading.value = false;
      return;
    }

    // Import data
    importReviewAPI(BmState.uuid, formValue.product, rawReviews, reviewUrl)
      .then((res: any) => {
        Store.updateImportResult(res.total, res.unpublished);

        if (!res.unpublished.length) {
          Store.changeStep(STEP.DONE);
        } else {
          Store.changeStep(STEP.RESULT);
        }
      })
      .finally(() => (isLoading.value = false));
  };

  const handleCountryChange = () => {
    setTimeout(() => {
      if (!formValue.countries.length) {
        formValue.countries = ['ALL'];
      } else if (formValue.countries.length >= 2) {
        var index = formValue.countries.indexOf('ALL');
        if (index !== -1) {
          formValue.countries.splice(index, 1);
        }
      }
    }, 100);
  };

  const handleCountrySelect = (res) => {
    if (res == 'ALL') {
      formValue.countries = ['ALL'];
    }
  };

  const handleProductSelect = (_, _product) => {
    BmState.product = _product;
  };

  const quantityHelperText = computed(() => {
    return `The quantity of reviews that it will be imported to. (Max is ${formValue.maxQuantity})`;
  });
</script>

<template>
  <form>
    <div class="wba-form-row">
      <label class="form-label">Shop</label>
      <input type="text" disabled class="form-control" :value="BmState.shop.name" />
    </div>
    <div class="wba-form-row">
      <div class="title-with-icon">
        <label for="product_id" class="form-label">Product </label>
        <Popper
          content="The product that these reviews will be imported to."
          v-bind="tooltipSeting"
        >
          <HelpIcon />
        </Popper>
      </div>
      <Multiselect
        @select="handleProductSelect"
        :disabled="isLoading"
        v-bind="productSelectEl"
        v-model="formValue.product"
      >
        <template v-slot:singlelabel="{ value }">
          <div class="multiselect-single-label">
            <img class="character-label-icon" :src="value.icon" /> {{ value.label }}
          </div>
        </template>

        <template v-slot:option="{ option }">
          <img class="character-option-icon" :src="option.icon" /> {{ option.label }}
        </template>
      </Multiselect>
    </div>
    <div class="wba-form-row">
      <div class="title-with-icon">
        <label for="product_id" class="form-label">Rating </label>
        <Popper
          :content="'Only fetch reviews are greater than ' + formValue.rating + ' star'"
          v-bind="tooltipSeting"
        >
          <HelpIcon />
        </Popper>
      </div>

      <select class="form-select" v-model="formValue.rating">
        <option value="5">From 5 star</option>
        <option value="4">From 4 star</option>
        <option value="3">From 3 star</option>
        <option value="2">From 2 star</option>
        <option value="1">From 1 star</option>
      </select>
    </div>

    <div class="wba-form-row">
      <div class="title-with-icon">
        <label for="product_id" class="form-label">Quantity </label>
        <Popper :content="quantityHelperText" v-bind="tooltipSeting">
          <HelpIcon />
        </Popper>
      </div>
      <input
        :disabled="isLoading"
        type="number"
        :max="formValue.maxQuantity"
        v-model="formValue.quantity"
        class="form-control"
        id="review_qualtity"
      />
    </div>
    <div class="wba-form-row" v-if="formValue.show_country">
      <div class="title-with-icon">
        <label for="product_id" class="form-label">Country </label>
      </div>
      <Multiselect
        @change="handleCountryChange"
        @select="handleCountrySelect"
        :disabled="isLoading"
        v-model="formValue.countries"
        v-bind="countrySelectEL"
      >
      </Multiselect>
    </div>
    <div class="wba-form-row">
      <label for="review_qualtity" class="form-label">Optional</label>
      <div class="wba-gp-checkbox">
        <div class="form-check" v-if="formValue.show_has_media">
          <input
            :disabled="isLoading"
            v-model="formValue.hasNoMedia"
            @change="formValue.hasMedia && (formValue.hasMedia = !formValue.hasNoMedia)"
            class="form-check-input"
            type="checkbox"
            id="onHasNoMedia"
          />
          <label class="form-check-label" for="onHasNoMedia">
            Only reviews WITHOUT media should be imported
          </label>
        </div>
        <div class="form-check" v-if="formValue.show_has_media">
          <input
            :disabled="isLoading"
            v-model="formValue.hasMedia"
            @change="formValue.hasNoMedia && (formValue.hasNoMedia = !formValue.hasMedia)"
            class="form-check-input"
            type="checkbox"
            id="onHasMedia"
          />
          <label class="form-check-label" for="onHasMedia">
            Only reviews WITH media should be imported
          </label>
        </div>
        <div class="form-check">
          <input
            :disabled="isLoading"
            v-model="formValue.autoGenerateName"
            class="form-check-input"
            type="checkbox"
            id="genCustomerName"
          />
          <label class="form-check-label" for="genCustomerName">
            Auto generate new customer name
          </label>
        </div>
        <div class="form-check" v-if="formValue.show_translate">
          <input
            :disabled="isLoading"
            v-model="formValue.autoTranslate"
            class="form-check-input"
            type="checkbox"
            id="autoTranslate"
          />
          <label class="form-check-label" for="autoTranslate">
            Try to translate into English
          </label>
        </div>
      </div>
    </div>
    <div class="wba-form-row" v-show="!isLoading">
      <button
        :disabled="!(!!formValue.product && formValue.quantity && formValue.countries.length)"
        @click="handleSubmit"
        type="button"
        class="btn btn-primary btn-submit btn-sm"
      >
        Submit
      </button>
    </div>
    <div class="wba-form-status" v-show="isLoading">
      <LoadingSVG class="wba-spin-icon"></LoadingSVG>
      <span>
        Fetching...
        <strong>{{ formValue.totalFetchedItems }}/{{ formValue.quantity }}</strong>
        reviews</span
      >
    </div>
  </form>
</template>

<style lang="less">
  @import '@vueform/multiselect/themes/default.css';

  form {
    @apply grid gap-16px;

    .form-check-label {
      font-weight: 300;
    }

    input {
      box-sizing: border-box;
      width: 100%;
    }

    .wba-form-row {
      @apply flex flex-col;

      .title-with-icon {
        @apply flex justify-start items-center space-x-6px;

        svg {
          width: 12px;
          height: 12px;
          @apply fill-gray-600 cursor-pointer border-0 ml-5px !mb-4px;
        }
      }

      .form-label {
        margin-bottom: 4px;
      }

      .wba-gp-checkbox {
        margin-left: 16px;
      }

      .form-check-input {
        width: 18px;
        height: 18px;
      }

      .form-check {
        @apply flex justify-start items-center space-x-6px;
      }
    }

    .btn-submit {
      margin-top: 10px;
    }

    .wba-form-status {
      margin-top: 10px;
      // font-size: 16px;
      @apply flex justify-center items-center space-x-6px bg-gray-200 border rounded-sm border-gray-200 border-solid p-10px;

      svg {
        width: 16px;
        height: 16px;
        margin-right: 5px;
        -webkit-animation: spin 1s linear infinite;
        animation: spin 1s linear infinite;
      }
    }
  }
</style>
