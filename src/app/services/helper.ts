import axios from 'axios';
import { IBookmarkFilter, IReview } from './types';

export const genAliExpressV2FeedbackURL = (filter: IBookmarkFilter) => {
  let hostPath = window.location.toString();

  // Dev mod
  // hostPath = 'https://vi.aliexpress.com/item/1005005071966305.html';

  const rExp: RegExp = /aliexpress\.[^\/]+\/([^\/]+)\/([^\.]+)/;
  let result = rExp.exec(hostPath);
  const productCode = result ? result[2] : null;

  if (!productCode) {
    return null;
  }

  let url =
    'https://feedback.aliexpress.com/pc/searchEvaluation.do?pageSize=500&sort=complex_default&productId=' +
    productCode;

  if (filter.hasMedia) {
    url += '&filter=image';
  } else {
    url += '&filter=all';
  }

  if (filter.autoTranslate) {
    url += '&lang=en_US';
  }

  return url;
};

export const genAliExpressV1FeedbackURL = (filter: IBookmarkFilter) => {
  let url: any = document.getElementById('product-evaluation')?.getAttribute('src');

  // Convert to https
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  if (filter.hasMedia) {
    url += '&withPictures=true';
  }

  url += '&translate=';
  url += filter.autoTranslate ? 'Y' : 'N';

  return url;
};

export const genAmazonURL = (filter: IBookmarkFilter) => {
  let tmpUrl = document.querySelector('[data-hook^="see-all-reviews"]')?.getAttribute('href');

  if (!tmpUrl) {
    return null;
  }

  tmpUrl += '&sortBy=recent';

  if (filter.rating >= 3) {
    tmpUrl += '&filterByStar=positive';
  }

  return window.location.protocol + '//' + window.location.host + tmpUrl;
};

export const fetchAmazonReviews = async (
  filter: IBookmarkFilter,
  url: any = null,
  page = 1,
  result: IReview[] = [],
): Promise<any[]> => {
  if (!url) {
    return result;
  }

  if (filter.hasMedia) {
    url += '&mediaType=media_reviews_only';
  }

  const htmlStr = await axios
    .get(url)
    .then((res) => res.data)
    .catch((_) => null);
  if (!htmlStr) {
    return result;
  }

  const { reviews, nextPageUrl } = parseAmazonHTML(htmlStr);

  reviews
    // Filter data
    .filter((item) => {
      let valid = item.rate >= filter.rating;
      valid = valid && item.customer_name;

      if (filter.hasMedia) {
        valid = valid && item.images.length > 0;
      }

      return valid;
    })
    // Append data
    .forEach((item) => {
      if (result.length >= filter.quantity) {
        return;
      }

      if (filter.autoGenerateName) {
        item.customer_name = null;
      }

      if (filter.hasNoMedia) {
        item.images = [];
      }

      result.push(item);

      filter.totalFetchedItems = result.length;
    });

  // Filter limit and query next page
  if (result.length >= filter.quantity || !nextPageUrl) {
    return result;
  }

  // Delay 300 miliseconds
  await new Promise((res) => setTimeout(res, 300));

  return await fetchAmazonReviews(filter, nextPageUrl, page + 1, result);
};

const parseAmazonHTML = (htmlStr: string): { reviews: IReview[]; nextPageUrl: any } => {
  const reviews: IReview[] = [];

  const htmlDoc: Document = new DOMParser().parseFromString(htmlStr, 'text/html');
  htmlDoc.querySelectorAll('[id^="customer_review"]').forEach((el) => {
    const images: any[] = [];
    el.querySelectorAll('div.review-image-container img').forEach((__el) => {
      images.push(__el.getAttribute('src')?.replace('._SY88', ''));
    });

    let rate: any = el.querySelector('i.review-rating');
    if (rate.classList.contains('a-star-1')) {
      rate = 1;
    } else if (rate.classList.contains('a-star-2')) {
      rate = 2;
    } else if (rate.classList.contains('a-star-3')) {
      rate = 3;
    } else if (rate.classList.contains('a-star-4')) {
      rate = 4;
    } else if (rate.classList.contains('a-star-5')) {
      rate = 5;
    } else {
      return true;
    }

    const feedbackInfo = el
      .querySelector('span.review-date')
      ?.textContent?.match(/Reviewed in (.+)\ on (.+)/i);

    const tempItem = {
      rate,
      country: feedbackInfo ? feedbackInfo[1] : null,
      customer_name: el.querySelector('span.a-profile-name')?.textContent,
      feedback: el.querySelector('[data-hook="review-body"]')?.textContent,
      feedback_time: feedbackInfo ? feedbackInfo[2] : null,
      feedback_id: el.parentElement?.parentElement?.getAttribute('id'),
      images,
    };

    reviews.push(tempItem);
  });

  return {
    reviews,
    nextPageUrl: htmlDoc.querySelector('ul.a-pagination li.a-last a')?.getAttribute('href'),
  };
};

export const fetchAliExpressV2Reviews = async (
  filter: IBookmarkFilter,
  url: any,
  page = 1,
  result: IReview[] = [],
): Promise<any[]> => {
  const jsonData = await axios
    .get(url + '&page=' + page)
    .then((res) => res.data)
    .catch((_) => null);

  if (!jsonData) {
    return result;
  }

  const { reviews, hasNextpage } = parseAliReviewsV2(jsonData.data, filter);

  reviews
    // Filter data
    .filter((item) => {
      let valid = filter.countries.find((el) => {
        return el === 'ALL' || el === item.country;
      });

      valid = valid && item.rate >= filter.rating;
      valid = valid && item.customer_name;

      if (filter.hasMedia) {
        valid = valid && item.images.length > 0;
      }

      return valid;
    })
    // Append data
    .forEach((item) => {
      if (result.length >= filter.quantity) {
        return;
      }

      if (filter.autoGenerateName) {
        item.customer_name = null;
      }

      result.push(item);

      filter.totalFetchedItems = result.length;
    });

  // Filter limit and query next page
  if (result.length >= filter.quantity || !hasNextpage) {
    return result;
  }

  // Delay 1000 miliseconds
  await new Promise((res) => setTimeout(res, 1000));

  return await fetchAliExpressV2Reviews(filter, url, page + 1, result);
};

export const fetchAliExpressV1Reviews = async (
  filter: IBookmarkFilter,
  url: any,
  page = 1,
  result: IReview[] = [],
): Promise<any[]> => {
  const htmlStr = await axios
    .get(url + '&page=' + page)
    .then((res) => res.data)
    .catch((_) => null);
  if (!htmlStr) {
    return result;
  }

  const { reviews, hasNextpage } = parseAliReviewsV1(htmlStr);

  reviews
    // Filter data
    .filter((item) => {
      let valid = filter.countries.find((el) => {
        return el === 'ALL' || el === item.country;
      });

      valid = valid && item.rate >= filter.rating;
      valid = valid && item.customer_name;

      if (filter.hasMedia) {
        valid = valid && item.images.length > 0;
      }

      return valid;
    })
    // Append data
    .forEach((item) => {
      if (result.length >= filter.quantity) {
        return;
      }

      if (filter.autoGenerateName) {
        item.customer_name = null;
      }

      if (filter.hasNoMedia) {
        item.images = [];
      }

      result.push(item);

      filter.totalFetchedItems = result.length;
    });

  // Filter limit and query next page
  if (result.length >= filter.quantity || !hasNextpage) {
    return result;
  }

  // Delay 1000 miliseconds
  await new Promise((res) => setTimeout(res, 1000));

  return await fetchAliExpressV1Reviews(filter, url, page + 1, result);
};

const parseAliReviewsV1 = (htmlStr: string): { reviews: IReview[]; hasNextpage: boolean } => {
  const reviews: IReview[] = [];

  const htmlDoc: Document = new DOMParser().parseFromString(htmlStr, 'text/html');
  htmlDoc.querySelectorAll('.feedback-item').forEach((el) => {
    const images: any[] = [];
    el.querySelectorAll('.pic-view-item img').forEach((__el) => {
      images.push(__el.getAttribute('src'));
    });

    let rate: any = el
      .querySelector('.star-view span')
      ?.getAttribute('style')
      ?.match(/[0-9]+/g)?.[0];
    rate = +(rate ?? 0) / 20;

    let feedback_time: any = el.querySelector('.buyer-feedback span.r-time-new')?.textContent!;
    feedback_time = new Date(feedback_time);
    feedback_time = feedback_time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const tempItem = {
      rate,
      country: el.querySelector('.user-country')?.textContent,
      customer_name: el.querySelector('.user-name')?.textContent,
      feedback: el.querySelector('.buyer-feedback span:nth-child(1)')?.textContent,
      feedback_time,
      feedback_id: el.querySelector('.feedback-id')?.getAttribute('value'),
      images,
    };

    reviews.push(tempItem);
  });

  return {
    reviews,
    hasNextpage: !!htmlDoc.querySelectorAll('a.ui-pagination-next').length,
  };
};

const parseAliReviewsV2 = (
  jsonData: any,
  filter: IBookmarkFilter,
): { reviews: IReview[]; hasNextpage: boolean } => {
  const reviews: IReview[] = [];

  jsonData.evaViewList.forEach((el) => {
    let feedback_time: any = new Date(el.evalDate);
    feedback_time = feedback_time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const feedback =
      filter.autoTranslate && el.buyerTranslationFeedback
        ? el.buyerTranslationFeedback
        : el.buyerFeedback;
    let images: any[] = el.images ?? [];

    if (filter.hasNoMedia) {
      images = [];
    }

    if ((feedback === undefined || !feedback) && !images.length) {
      return; // continue
    }

    const tempItem = {
      rate: el.buyerEval / 20,
      country: el.buyerCountry,
      customer_name: el.buyerName,
      feedback,
      feedback_time,
      feedback_id: el.evaluationId,
      images,
    };

    reviews.push(tempItem);
  });

  return {
    reviews,
    hasNextpage: jsonData.totalPage && jsonData.currentPage != jsonData.totalPage,
  };
};

export const fetchEtsyReviews = async (
  filter: IBookmarkFilter,
  result: IReview[] = [],
): Promise<any[]> => {
  const { reviews, hasNextpage } = parseEtsyReview();

  reviews
    // Filter data
    .filter((item) => {
      let valid = filter.countries.find((el) => {
        return el === 'ALL' || el === item.country;
      });

      valid = valid && item.rate >= filter.rating;
      valid = valid && item.customer_name;

      return valid;
    })
    // Append data
    .forEach((item) => {
      if (result.length >= filter.quantity) {
        return;
      }

      if (filter.autoGenerateName) {
        item.customer_name = null;
      }

      result.push(item);

      filter.totalFetchedItems = result.length;
    });

  // Filter limit and query next page
  if (result.length >= filter.quantity || !hasNextpage) {
    return result;
  }

  // Click next page
  let nextPage: any = document.querySelector('#reviews li:nth-last-child(1) a');
  nextPage.click();

  // Delay 1000 miliseconds
  await new Promise((res) => setTimeout(res, 2000));

  return await fetchEtsyReviews(filter, result);
};

const parseEtsyReview = (): { reviews: IReview[]; hasNextpage: boolean } => {
  const reviews: IReview[] = [];
  const reviewItems = document.querySelectorAll('[data-review-region]');

  if (!reviewItems.length) {
    return returnData();
  }

  reviewItems.forEach((el) => {
    const rate = +(el.querySelector('input[type=hidden][name=rating]')?.getAttribute('value') ?? 0);
    const feedback = el.querySelector('[data-review-text-toggle-wrapper]')?.textContent?.trim();
    const customerEl = el.querySelector('[data-review-username]');
    const customer_name = customerEl?.textContent?.trim();

    let feedback_time: any = customer_name
      ? customerEl?.parentNode?.textContent?.replace(customer_name, '').trim()
      : new Date();
    feedback_time = new Date(feedback_time);
    feedback_time = feedback_time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let image = el.querySelector('img')?.getAttribute('src');

    // Skipt if it is a avatar photo
    if (image?.includes('75x75')) {
      image = null;
    } else if (image?.includes('300x300')) {
      image = image.replace('300x300', '600x600');
    }

    if (!feedback && !image) {
      return; // continue
    }

    const tempItem = {
      rate,
      country: null,
      customer_name,
      feedback,
      feedback_time,
      feedback_id: 'etsy_' + customerEl?.getAttribute('data-transaction-id'),
      images: image ? [image] : [],
    };

    reviews.push(tempItem);
  });

  let nextPage: any = document.querySelector('#reviews li:nth-last-child(1) a');
  if (!nextPage) {
    return returnData();
  }

  nextPage = nextPage.hasAttribute('aria-disabled');
  return returnData(!nextPage);

  function returnData(hasNextpage = false) {
    return {
      reviews,
      hasNextpage,
    };
  }
};
