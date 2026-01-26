import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const SplitPhoneInput = ({ value, onChange, error, name, required = false, setIsValid }) => {
    const [dialCode, setDialCode] = useState('91'); // Default to India
    const [localNumber, setLocalNumber] = useState('');
    const [expectedLength, setExpectedLength] = useState(10); // Default for India

    // Sync internal state with external value (e.g., when loading profile)
    useEffect(() => {
        if (value && !localNumber && dialCode === '91') {
            if (value.startsWith('91')) {
                setDialCode('91');
                setLocalNumber(value.substring(2));
            } else if (value.startsWith('+')) {
                const clean = value.substring(1);
                if (clean.startsWith('91')) {
                    setDialCode('91');
                    setLocalNumber(clean.substring(2));
                }
            }
        }
    }, [value, dialCode, localNumber]);

    // Update validation status whenever state changes
    useEffect(() => {
        if (setIsValid) {
            setIsValid(localNumber.length === expectedLength);
        }
    }, [localNumber, expectedLength, setIsValid]);

    const handleCountryChange = (val, data) => {
        if (data && data.dialCode) {
            setDialCode(data.dialCode);

            // Calculate expected length from format (e.g., "+.. (...) ...-....")
            const format = data.format || '';
            const totalDots = (format.match(/\./g) || []).length;
            const dialCodeDots = (data.dialCode.match(/\d/g) || []).length;
            const localDots = totalDots - dialCodeDots;

            const newExpectedLength = localDots > 0 ? localDots : 10;
            setExpectedLength(newExpectedLength);

            // If current local number is too long for the new country, truncate it
            const truncatedNumber = localNumber.slice(0, newExpectedLength);
            setLocalNumber(truncatedNumber);

            const newFullValue = data.dialCode + truncatedNumber;
            if (newFullValue !== value) {
                onChange(newFullValue);
            }
        }
    };

    const handleNumberChange = (e) => {
        // Digits only and strictly limit length
        const num = e.target.value.replace(/\D/g, '').slice(0, expectedLength);
        setLocalNumber(num);
        const newFullValue = dialCode + num;
        if (newFullValue !== value) {
            onChange(newFullValue);
        }
    };

    return (
        <div className={`split-phone-input-wrapper ${error ? 'split-phone-input-error' : ''}`}>
            <div className="split-phone-input-field country">
                <label>Country code</label>
                <div className="split-phone-input relative">
                    <PhoneInput
                        country={'in'}
                        value={dialCode}
                        onChange={handleCountryChange}
                        enableSearch={true}
                        searchPlaceholder="Search country"
                        containerClass="phone-country-selector"
                        inputStyle={{ display: 'none' }}
                        buttonClass="phone-dropdown-button-full"
                        dropdownClass="phone-dropdown"
                        searchClass="phone-search"
                    />
                    <span className="absolute left-[48px] top-1/2 -translate-y-1/2 pointer-events-none font-medium text-slate-900 dark:text-neutral-100">
                        +{dialCode}
                    </span>
                </div>
            </div>

            <div className="split-phone-input-field number">
                <label>Phone number</label>
                <input
                    type="tel"
                    value={localNumber}
                    onChange={handleNumberChange}
                    placeholder="Phone number"
                    required={required}
                    name={name}
                    maxLength={expectedLength}
                />
            </div>
        </div>
    );
};

export default SplitPhoneInput;
