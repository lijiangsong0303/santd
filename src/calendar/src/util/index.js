/**
 * @file Santd calendar util index file
 * @author mayihui@baidu.com
 **/
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(utc);
dayjs.extend(localeData);

const defaultDisabledTime = {
    disabledHours() {
        return [];
    },
    disabledMinutes() {
        return [];
    },
    disabledSeconds() {
        return [];
    }
};

export function getTodayTime(value) {
    const locale = value.locale();
    require(`dayjs/locale/${locale}.js`);
    return dayjs().locale(locale).utcOffset(value.utcOffset());
}

export function getTitleString(value) {
    return value.format('YYYY-MM-DD');
}

export function getTodayTimeStr(value) {
    const today = getTodayTime(value);
    return getTitleString(today);
}

export function getMonthName(month) {
    const locale = month.locale();
    const localeData = month.localeData();
    return localeData[locale === 'zh-cn' ? 'months' : 'monthsShort'](month);
}

export function syncTime(from, to) {
    if (!dayjs.isDayjs(from) || !dayjs.isDayjs(to)) {
        return to;
    }
    return to
        .hour(from.hour())
        .minute(from.minute())
        .second(from.second())
        .millisecond(from.millisecond());
}

export function getTimeConfig(value, disabledTime) {
    let disabledTimeConfig = disabledTime ? disabledTime(value) : {};
    disabledTimeConfig = {
        ...defaultDisabledTime,
        ...disabledTimeConfig
    };
    return disabledTimeConfig;
}

export function isTimeValidByConfig(value, disabledTimeConfig) {
    let invalidTime = false;
    if (value) {
        const hour = value.hour();
        const minutes = value.minute();
        const seconds = value.second();
        const disabledHours = disabledTimeConfig.disabledHours();
        if (disabledHours.indexOf(hour) === -1) {
            const disabledMinutes = disabledTimeConfig.disabledMinutes(hour);
            if (disabledMinutes.indexOf(minutes) === -1) {
                const disabledSeconds = disabledTimeConfig.disabledSeconds(hour, minutes);
                invalidTime = disabledSeconds.indexOf(seconds) !== -1;
            }
            else {
                invalidTime = true;
            }
        }
        else {
            invalidTime = true;
        }
    }
    return !invalidTime;
}

export function isTimeValid(value, disabledTime) {
    const disabledTimeConfig = getTimeConfig(value, disabledTime);
    return isTimeValidByConfig(value, disabledTimeConfig);
}

export function isAllowedDate(value, disabledDate, disabledTime) {
    if (disabledDate) {
        if (disabledDate(value)) {
            return false;
        }
    }
    if (disabledTime) {
        if (!isTimeValid(value, disabledTime)) {
            return false;
        }
    }
    return true;
}

export function formatDate(value, format) {
    if (!value) {
        return '';
    }

    if (Array.isArray(format)) {
        format = format[0];
    }

    return value.format(format);
}
