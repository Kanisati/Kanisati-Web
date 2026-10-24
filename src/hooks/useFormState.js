import { useReducer } from 'react';
import { errorMessage } from '../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'change': return { ...state, values: { ...state.values, [action.name]: action.value }, errors: { ...state.errors, [action.name]: undefined }, error: '', message: '' };
    case 'start': return { ...state, submitting: true, errors: {}, error: '', message: '' };
    case 'success': return { ...state, submitting: false, message: action.message || '' };
    case 'error': return { ...state, submitting: false, errors: action.errors, error: action.error };
    default: return state;
  }
}

/** Drafts and field validation stay local to their form instead of being global page state. */
export function useFormState(initialValues) {
  const [state, dispatch] = useReducer(reducer, { values: initialValues, errors: {}, submitting: false, error: '', message: '' });
  const setValue = (name, value) => dispatch({ type: 'change', name, value });

  const submit = (action) => async (event) => {
    event.preventDefault();
    if (state.submitting) return;
    dispatch({ type: 'start' });
    try {
      const message = await action(state.values);
      dispatch({ type: 'success', message });
    } catch (error) {
      const errors = error.errors ?? {};
      const unknown = Object.keys(errors).filter((name) => !(name in initialValues));
      dispatch({ type: 'error', errors, error: !Object.keys(errors).length || unknown.length ? errorMessage(error) : '' });
    }
  };

  return {
    ...state,
    setValue,
    submit,
    field: (name) => ({
      value: state.values[name],
      error: state.errors[name],
      onChange: (event) => setValue(name, event.currentTarget.value),
    }),
  };
}
