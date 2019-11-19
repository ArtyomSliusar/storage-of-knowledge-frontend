import backend from "../apis/backend";
import {
  APPLY_FILTERS,
  GET_ITEMS,
  GET_MORE_ITEMS,
  GET_USER,
  LOGIN,
  LOGOUT,
  OPEN_SNACKBAR,
  CLOSE_SNACKBAR,
  REGISTER,
  GET_ITEM_COMMENTS,
  GET_ITEM_DETAILS,
  UPDATE_ITEM,
  DELETE_ITEM,
  ADD_ITEM_LIKE,
  DELETE_ITEM_LIKE,
  ADD_ITEM_COMMENT,
  DELETE_ITEM_COMMENT,
  INITIALIZE_ITEMS,
  CHANGE_ITEMS_DISPLAY
} from "../constants";
import history from "../history";
import axios from "axios";

// TODO: DRY

export const login = (username, password) => async dispatch => {
  const response = await backend.post(
    "/token/",
    {
      username: username,
      password: password
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  dispatch({
    type: LOGIN,
    payload: { data: response.data }
  });
};

export const logout = () => async (dispatch, getState) => {
  await backend
    .post(
      "/logout/",
      {
        refresh: getState().auth.tokens.refresh
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getState().auth.tokens.access}`
        }
      }
    )
    .catch(error => {
      console.error(error);
    });

  dispatch({
    type: LOGOUT
  });

  history.push("/");
};

export const register = (
  username,
  email,
  password,
  timezone,
  recaptcha
) => async dispatch => {
  await backend.post(
    "/users/",
    {
      username: username,
      email: email,
      password: password,
      time_zone: timezone,
      recaptcha: recaptcha
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  dispatch({
    type: REGISTER
  });
};

export const getUser = userId => async (dispatch, getState) => {
  const response = await backend.get(`/users/${userId}/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getState().auth.tokens.access}`
    }
  });

  dispatch({
    type: GET_USER,
    payload: { data: response.data }
  });
};

export const applyFilters = filters => {
  return {
    type: APPLY_FILTERS,
    payload: { filters: filters }
  };
};

export const openSnackbar = (message, type) => {
  return {
    type: OPEN_SNACKBAR,
    payload: { message: message, type: type }
  };
};

export const initializeItems = () => {
  return {
    type: INITIALIZE_ITEMS
  };
};

export const changeItemsDisplay = params => {
  return {
    type: CHANGE_ITEMS_DISPLAY,
    payload: { display: params }
  };
};

export const closeSnackbar = () => {
  return {
    type: CLOSE_SNACKBAR
  };
};

export const getItems = (search, type) => async (dispatch, getState) => {
  const state = getState();
  const display = state.itemsMeta.display;
  const limitQuery = `limit=${display.limit}`;

  const searchQuery = search ? `&search=${search}` : "";

  const filtersQuery =
    state.filters.subjects.length > 0
      ? `&subjects=in:${state.filters.subjects.join(",")}`
      : "";

  const orderQuery = display.orderBy
    ? `&ordering=${
        display.order === "desc" ? "-" + display.orderBy : display.orderBy
      }`
    : "";

  const response = await backend.get(
    `/${type}/?${limitQuery}${filtersQuery}${searchQuery}${orderQuery}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: state.auth.user.loggedIn
          ? `Bearer ${state.auth.tokens.access}`
          : ""
      }
    }
  );

  dispatch({
    type: GET_ITEMS,
    payload: { data: response.data }
  });
};

export const getMoreItems = url => async (dispatch, getState) => {
  if (url) {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    });

    dispatch({
      type: GET_MORE_ITEMS,
      payload: { data: response.data }
    });
  }
};

export const getItem = (id, type) => async (dispatch, getState) => {
  const response = await backend.get(`/${type}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: GET_ITEM_DETAILS,
    payload: { data: response.data }
  });
};

export const updateNote = (noteId, noteData) => async (dispatch, getState) => {
  const response = await backend.put(
    `/notes/${noteId}`,
    {
      title: noteData.title,
      subjects: noteData.subjects,
      private: noteData.private,
      body: noteData.body
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );

  dispatch({
    type: UPDATE_ITEM,
    payload: { data: response.data }
  });
};

export const updateLink = (linkId, linkData) => async (dispatch, getState) => {
  const response = await backend.put(
    `/links/${linkId}`,
    {
      title: linkData.title,
      subjects: linkData.subjects,
      private: linkData.private,
      link: linkData.link
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );

  dispatch({
    type: UPDATE_ITEM,
    payload: { data: response.data }
  });
};

export const deleteNote = noteId => async (dispatch, getState) => {
  await backend.delete(`/notes/${noteId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: DELETE_ITEM
  });
};

export const deleteLink = linkId => async (dispatch, getState) => {
  await backend.delete(`/links/${linkId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: DELETE_ITEM
  });
};

export const createNote = noteData => async (dispatch, getState) => {
  // no redux state update
  return await backend.post(
    `/notes/`,
    {
      title: noteData.title,
      subjects: noteData.subjects,
      private: noteData.private,
      body: noteData.body
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );
};

export const createLink = linkData => async (dispatch, getState) => {
  // no redux state update
  return await backend.post(
    `/links/`,
    {
      title: linkData.title,
      subjects: linkData.subjects,
      private: linkData.private,
      link: linkData.link
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );
};

export const getItemLike = (id, type) => async (dispatch, getState) => {
  const userFilter = `?user=${getState().auth.user.id}`;

  const response = await backend.get(`/${type}/${id}/likes/${userFilter}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  if (response.data.length > 0) {
    dispatch({
      type: ADD_ITEM_LIKE,
      payload: { data: response.data[0] } // with user filter we should have only one like per item
    });
  } else {
    dispatch({
      type: DELETE_ITEM_LIKE
    });
  }
};

export const addItemLike = (id, type) => async (dispatch, getState) => {
  const response = await backend.post(
    `/${type}/${id}/likes/`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );

  dispatch({
    type: ADD_ITEM_LIKE,
    payload: { data: response.data }
  });
};

export const deleteItemLike = (id, type, likeId) => async (
  dispatch,
  getState
) => {
  await backend.delete(`/${type}/${id}/likes/${likeId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: DELETE_ITEM_LIKE
  });
};

export const getItemComments = (id, itemType) => async (dispatch, getState) => {
  const response = await backend.get(`/${itemType}/${id}/comments/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: GET_ITEM_COMMENTS,
    payload: { data: response.data }
  });
};

export const addItemComment = (id, type, body, parentId = null) => async (
  dispatch,
  getState
) => {
  await backend.post(
    `/${type}/${id}/comments/`,
    {
      body: body,
      parent: parentId
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: getState().auth.user.loggedIn
          ? `Bearer ${getState().auth.tokens.access}`
          : ""
      }
    }
  );

  dispatch({
    type: ADD_ITEM_COMMENT
  });
};

export const deleteItemComment = (id, type, commentId) => async (
  dispatch,
  getState
) => {
  await backend.delete(`/${type}/${id}/comments/${commentId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: getState().auth.user.loggedIn
        ? `Bearer ${getState().auth.tokens.access}`
        : ""
    }
  });

  dispatch({
    type: DELETE_ITEM_COMMENT
  });
};
