
export const authenticate = async () => {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: import.meta.env.SPOTIFY_API_CLIENT_ID,
    client_secret: import.meta.env.SPOTIFY_API_SECRET
  })

  const response = await fetch(import.meta.env.PUBLIC_SPOTIFY_API_AUTH_URL, {
    method:"POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  const { access_token } = await response.json();
  return access_token;
}

const fetcher = async ({ headers: newHeaders = {}, method = 'GET', url, body = null, retries = 1 }) => {
  if (retries === 0) {
    console.error('Max retries reached')
    return
  }

  try {
    const authToken = await authenticate()
    const response = await fetch(`${import.meta.env.PUBLIC_SPOTIFY_API_BASE_URL}${url}`, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...newHeaders
      },
      body
    })

    if (!response.ok) {
      if (response.status === 401) {
        const newAuthToken = await authenticate()

        fetcher({
          headers: {
            'Authorization': `Bearer ${newAuthToken}`
          },
          method,
          url,
          body,
          retries: retries - 1
        })
      }
    }

    const data = await response.json();
    return data

  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export default fetcher