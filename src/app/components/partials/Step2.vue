<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {Carousel, Slide, Navigation} from 'vue3-carousel';
import Popper from 'vue3-popper';

import CarouselTemplate from './Step2Carousel.vue';
import {LoadingSVG, NextSVG, PrevSVG} from '../../assets/icons';
import Store, {BmState, STEP} from '../../services/store';
import {publishAllReviewAPI} from '../../services/api';

const isLoading = ref(false);
const carouselRef = ref();

const tooltipSeting: any = {
  arrow: true,
  hover: true,
  placement: 'top',
  openDelay: 200,
  closeDelay: 100,
};

onMounted(() => {
  setTimeout(() => {
    try {
      carouselRef.value.restartCarousel();
    } catch (error) {
    }
  }, 800);
});

const handlePublishAll = () => {
  isLoading.value = true;

  publishAllReviewAPI(BmState.uuid, BmState.product.value).finally(() => {
    isLoading.value = false;
    Store.changeStep(STEP.DONE);
  });
};

const handleItemProcessed = (item) => {
  item.is_processed = true;
  carouselRef.value.next();

  const totalProcessed = BmState.unpublish_reviews.filter((c) => c.is_processed == true).length;

  // If all item has been processed - we will move to next step (DONE step)
  if (BmState.unpublish_reviews.length == totalProcessed) {
    Store.changeStep(STEP.DONE);
  }
};
</script>

<template>
  <div class="wba-bm-result">
    <div class="product-title"> {{ BmState.product.label }}</div>
    <div class="preview-results">
      <carousel ref="carouselRef">
        <slide v-for="(item, index) in BmState.unpublish_reviews" :key="item.id">
          <CarouselTemplate @processed="handleItemProcessed(item)" :review="item"/>
        </slide>
        <template #addons>
          <Navigation>
            <template #next>
              <NextSVG style="width: 32px; height: 32px"/>
            </template>
            <template #prev>
              <PrevSVG style="width: 32px; height: 32px"/>
            </template>
          </Navigation>
        </template>
      </carousel>
    </div>

    <ul class="statistic">
      <li>
        <span>Fetched</span>
        <span class="wba-number">{{ BmState.raw_reviews.length }} </span>
        <span>reviews and having </span>
        <span class="wba-number">
          {{ BmState.unpublish_reviews.length }} / {{ BmState.total_reviews }}
        </span>
        <span>unpublished reviews for this product.</span>
      </li>
    </ul>

    <div class="wba-group-btn">
      <button
          class="btn btn-outline-secondary btn-sm"
          style="width: 150px"
          @click="Store.changeStep(STEP.FORM)"
      >
        Back
      </button>
      <Popper content="Publish all unpublished reviews." v-bind="tooltipSeting">
        <button
            :disabled="isLoading"
            @click="handlePublishAll"
            class="btn btn-outline-primary btn-sm"
            style="width: 150px"
        >
          <LoadingSVG class="wba-spin-icon" v-if="isLoading"></LoadingSVG>
          Publish all
        </button>
      </Popper>
    </div>
  </div>
</template>

<style lang="less">
.wba-bm-result {
@apply flex flex-col justify-center items-center space-y-15px;

  .product-title {
  @apply text-20px font-semibold;
  }

  .statistic {
  @apply flex flex-wrap justify-center space-x-40px items-center list-disc w-full m-0 mb-20px;

    li {
    @apply text-blue-500;

      div.inline-block {
        border-width: 8px !important;
      }

      span {
      @apply text-gray-800 text-12px;

        &.wba-number {
          font-size: 15px;
          margin: 0 5px;
        @apply font-bold;
        }
      }
    }
  }

  .wba-group-btn {
  @apply flex items-center justify-around w-full;
  }

  .btn {
  @apply flex items-center justify-around;

    &.btn-outline-danger svg {
    @apply fill-red-800;
    }

    &.btn-outline-success svg {
    @apply fill-green-800;
    }

    svg {
      width: 16px;
      height: 16px;

      &.wba-spin-icon {
        -webkit-animation: spin 1s linear infinite;
        animation: spin 1s linear infinite;
      }
    }
  }

  .preview-results {
    @import '../../assets/carousel.less';

    .wba-testimonial-rotator {
      width: 100%;

      .wba-carousel__item {
      @apply flex flex-col justify-center items-center space-y-12px w-full bg-gray-50 rounded-6px p-24px;

        .wba-message {
        @apply my-8px;
        }

        .rating {
        @apply my-4px;
        }
      }
    }

    width: 520px;
    margin: 10px auto 10px;

    .wba-carousel__item {
      .images {
      @apply flex items-center justify-center space-x-8px;
      }

      .rating {
      @apply flex space-x-8px;
        color: #ffc107;
        font-size: 19px;
      }

      .wba-user-header {
      @apply flex space-x-16px;
      }

      .wba-user-title {
      @apply flex flex-col justify-center space-y-2px;

        .wba-user-name {
        }

        .wba-user-caption {
        @apply text-12px text-gray-400;
        }
      }

      .wba-message {
        margin-top: 10px !important;
        line-height: 25px !important;
      @apply font-light text-14px;
      }
    }
  }
}
</style>
