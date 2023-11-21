<script setup lang="ts">
  import { ref } from 'vue';
  import Popper from 'vue3-popper';

  // import FieldRating from '@vue-libs/components/common/Rating.vue';
  // import Avatar from '@vue-libs/components/common/Avatar.vue';
  import { LoadingSVG, RemoveSVG, EditSVG, PublishedSVG } from '../../assets/icons';
  import { deleteReviewAPI, publishReviewAPI } from '../../services/api';
  import { BmState } from '../../services/store';

  enum ELOADING {
    init,
    delete,
    publish,
    done,
  }

  const emit = defineEmits(['processed']);
  const props = defineProps({
    review: { type: Object, required: true },
  });

  const appURL = import.meta.env.VITE_FRONTEND_URL;
  const tooltipSeting: any = {
    arrow: true,
    hover: true,
    placement: 'top',
    openDelay: 200,
    closeDelay: 100,
  };

  const isLoading = ref(ELOADING.init);

  const redirectProductPage = () => {
    const url = `${appURL}/reviews?product_id=${BmState.product.value}&product_name=${BmState.product.label}`;
    window.open(url, '_blank');
  };

  const handlePublish = () => {
    isLoading.value = ELOADING.publish;
    emit('processed');

    publishReviewAPI(BmState.uuid, BmState.product.value, props.review.id).finally(() => {
      isLoading.value = ELOADING.done;
    });
  };

  const handleDelete = () => {
    isLoading.value = ELOADING.delete;
    emit('processed');

    deleteReviewAPI(BmState.uuid, BmState.product.value, props.review.id).finally(() => {
      isLoading.value = ELOADING.done;
    });
  };
</script>

<template>
  <div class="wba-testimonial-rotator" style="--wba-star_icon_color: #FFC107">
    <div class="wba-carousel__item">
      <div class="images">
        <template v-for="(url, index) in review.images" :key="index">
<!--          <Avatar class="avatar" :src="url" />-->
        </template>
      </div>

      <div class="wba-user-header">
        <div class="wba-user-title">
          <div class="wba-user-name">{{ review.customer_name }}</div>
          <div class="wba-user-caption">
            {{ review.feedback_date.toString().substring(0, 10) }}
          </div>
        </div>
      </div>

<!--      <FieldRating :rating="review.rate" />-->

      <div class="wba-group-btn">
        <Popper content="Delete this unpublished review." v-bind="tooltipSeting">
          <button
            v-if="isLoading != ELOADING.done"
            :disabled="!!isLoading"
            @click="handleDelete()"
            class="btn btn-outline-danger btn-sm btn-icon"
          >
            <RemoveSVG v-if="isLoading != ELOADING.delete"></RemoveSVG>
            <LoadingSVG class="wba-spin-icon" v-else></LoadingSVG>
          </button>
        </Popper>
        <Popper content="Edit this unpublished review." v-bind="tooltipSeting">
          <button
            :disabled="!!isLoading"
            @click="redirectProductPage"
            class="btn btn-outline-secondary btn-sm btn-icon"
          >
            <EditSVG></EditSVG>
          </button>
        </Popper>
        <Popper content="Publish this unpublished review." v-bind="tooltipSeting">
          <button
            v-if="isLoading != ELOADING.done"
            :disabled="!!isLoading"
            @click="handlePublish(review)"
            class="btn btn-outline-success btn-sm btn-icon"
          >
            <PublishedSVG v-if="isLoading != ELOADING.publish"></PublishedSVG>
            <LoadingSVG class="wba-spin-icon" v-else></LoadingSVG>
          </button>
        </Popper>
      </div>

      <div class="wba-message">
        {{
          review.feedback.length < 250 ? review.feedback : review.feedback.substring(0, 250) + '...'
        }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .btn-icon {
    @apply rounded-full p-12px;
  }
</style>
