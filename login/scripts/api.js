// Helper simples para chamadas à API
(function(window){
  const DEFAULT_BASE = 'http://localhost:8080';
  const api = {
    baseUrl: window.__API_BASE_URL__ || DEFAULT_BASE,

    async request(method, path, body, options = {}){
      const url = this.baseUrl + path;
      const headers = Object.assign({}, options.headers || {});
      if (!headers['Content-Type'] && (body !== undefined && body !== null)){
        headers['Content-Type'] = 'application/json';
      }

      if (options.auth !== false){
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const fetchOpts = { method, headers };
      if (body !== undefined && body !== null){
        fetchOpts.body = headers['Content-Type'] === 'application/json' ? JSON.stringify(body) : body;
      }

      const res = await fetch(url, fetchOpts);
      let data = null;
      try { data = await res.json(); }
      catch(e) {
        try { data = await res.text(); } catch(e2) { data = null; }
      }
      return { ok: res.ok, status: res.status, data };
    },

    get(path, options){ return this.request('GET', path, null, options); },
    post(path, body, options){ return this.request('POST', path, body, options); },
    put(path, body, options){ return this.request('PUT', path, body, options); },
    del(path, options){ return this.request('DELETE', path, null, options); }
  };

  window.api = api;
})(window);
