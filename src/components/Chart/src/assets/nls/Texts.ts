export type Languages = 'en' | 'fr';

export type TimeAgo = {
    ago: string;
    justNow: string;
    singular: {
        second: string;
        minute: string;
        hour: string;
        day: string;
        week: string;
        month: string;
        year: string;
    },
    plural: {
        second: string;
        minute: string;
        hour: string;
        day: string;
        week: string;
        month: string;
        year: string;
    }
};

const timeAgoTextsEN: TimeAgo = {
    ago: 'ago',
    justNow: 'just now',
    singular: {
        second: 'second',
        minute: 'minute',
        hour: 'hour',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year'
    },
    plural: {
        second: 'seconds',
        minute: 'minutes',
        hour: 'hours',
        day: 'days',
        week: 'weeks',
        month: 'months',
        year: 'years'
    }
};

const timeAgoTextsFR: TimeAgo = {
    ago: 'il y a',
    justNow: 'à l\'instant',
    singular: {
        second: 'seconde',
        minute: 'minute',
        hour: 'heure',
        day: 'jour',
        week: 'semaine',
        month: 'mois',
        year: 'an'
    },
    plural: {
        second: 'secondes',
        minute: 'minutes',
        hour: 'heures',
        day: 'jours',
        week: 'semaines',
        month: 'mois',
        year: 'ans'
    }
};

export { timeAgoTextsEN, timeAgoTextsFR }