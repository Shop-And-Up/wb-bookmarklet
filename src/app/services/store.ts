import { reactive } from 'vue';

export enum STEP {
  LOADING,
  ERROR,
  FORM,
  RESULT,
  DONE,
  NO_REVIEWS
}

export enum SITE_TYPE {
  Unknown,
  Amazon,
  Etsy,
  AliExpressV1,
  AliExpressV2,
}

interface IBookmarkletState {
  step: STEP;
  site_type: SITE_TYPE;
  uuid: any;
  product: any;
  shop: any;
  total_reviews: number;
  unpublish_reviews: any[];
  raw_reviews: any[];
}

export const BmState = reactive<IBookmarkletState>({
  step: STEP.LOADING,
  site_type: SITE_TYPE.Unknown,
  uuid: null,
  shop: {},
  product: {},
  total_reviews: 0,
  unpublish_reviews: [],
  raw_reviews: [],
});

export default {
  setUUID: (uuid: any) => {
    BmState.uuid = uuid;
  },
  setSiteType: (type: any) => {
    BmState.site_type = type;
  },
  changeStep: (step: STEP) => {
    BmState.step = step;
  },
  setProduct: (product: any) => {
    BmState.product = product;
  },
  setShopInfo: (shop: any) => {
    BmState.shop = shop;
  },
  updateImportResult: (total, unpublish: any[]) => {
    BmState.total_reviews = total;
    BmState.unpublish_reviews = unpublish;
  },
  updateRawReview: (data) => {
    BmState.raw_reviews = data;
  },
};
