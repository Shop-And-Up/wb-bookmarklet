export interface IBookmarkFilter {
  countries: any[];
  quantity: number;
  hasMedia: boolean;
  hasNoMedia: boolean;
  autoTranslate: boolean;
  totalFetchedItems: number;
  rating: number;
  autoGenerateName: boolean;
}

export interface IReview {
  rate: number;
  country: any;
  customer_name: any;
  images: any[];
  feedback: any;
  feedback_time: any;
  feedback_id: any;
}
