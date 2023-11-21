import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL + import.meta.env.VITE_GLOB_API_BM_PREFIX,
  headers: {
    'Content-type': 'application/json',
  },
});

export const getShopAPI = (uuid: string) => {
  return http.get('/shop', { params: { uuid } });
};

export const searchProductAPI = (uuid: string, query: string) => {
  return http.get('/products', { params: { uuid, query } });
};

export const importReviewAPI = (uuid: string, product_id: any, reviews: any, crawler_url: any) => {
  return http.post('/reviews/import', { uuid, reviews, crawler_url, product_id }).then((res) => {
    res.data.unpublished = res.data.unpublished.map((c) => {
      c.is_processed = false;
      return c;
    });

    return res.data;
  });
};

export const publishAllReviewAPI = (uuid: string, product_id: any) => {
  return http.post('/reviews/publish-all', { uuid, product_id });
};

export const deleteReviewAPI = (uuid: string, product_id, id: any) => {
  return http.post(`/reviews/${id}/delete`, { uuid, product_id }).then((res) => res.data);
};

export const publishReviewAPI = (uuid: string, product_id, id: any) => {
  return http.post(`/reviews/${id}/publish`, { uuid, product_id }).then((res) => res.data);
};
