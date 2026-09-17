import React from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { TFilterDialogProps } from '../journal.types';
import Filters from './filters';

const FilterDialog = React.forwardRef<HTMLDivElement, TFilterDialogProps>(
    (
        { toggle_ref, checked_filters, filters, filterMessage, is_filter_dialog_visible, toggleFilterDialog },
        ref
    ) => {
        const internal_wrapper_ref = React.useRef<HTMLDivElement>(null);
        const wrapper_ref = (ref as React.RefObject<HTMLDivElement>) || internal_wrapper_ref;
        const validateClickOutside = (event: React.ChangeEvent<HTMLInputElement>) =>
            is_filter_dialog_visible && !toggle_ref.current?.contains(event.target);

        useOnClickOutside(wrapper_ref, toggleFilterDialog, validateClickOutside);

        return (
            <Filters
                wrapper_ref={wrapper_ref}
                checked_filters={checked_filters}
                filters={filters}
                filterMessage={filterMessage}
                className='filter-dialog'
            />
        );
    }
);

FilterDialog.displayName = 'FilterDialog';

export default FilterDialog;
