import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const DEFAULT_STATE = {
  data: null,
  loading: true,
  error: null,
  isDefault: false,
};

export const usePageContent = (slug) => {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await axios.get(getApiUrl(`api/pages/${slug}`));
        if (!isMounted) return;
        setState({
          data: response.data?.data || null,
          loading: false,
          error: null,
          isDefault: !!response.data?.isDefault,
        });
      } catch (error) {
        console.error('Error fetching page content:', error);
        if (!isMounted) return;
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || 'Failed to load content',
          isDefault: false,
        });
      }
    };

    if (slug) {
      fetchContent();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return state;
};

export default usePageContent;

