import { withPluginApi } from 'discourse/lib/plugin-api';
import PageTracker from 'discourse/lib/page-tracker';

var currentUser = Discourse.User.current();

var banner_category_top = Discourse.SiteSettings.adtech_category_top_code;
var banner_post_top = Discourse.SiteSettings.adtech_post_top_code;
var banner_post_n_first = Discourse.SiteSettings.adtech_post_n_first_code;
var banner_post_n_second = Discourse.SiteSettings.adtech_post_n_second_code;
var banner_post_bottom = Discourse.SiteSettings.adtech_post_bottom_code;

const mobileView = Discourse.Site.currentProp('mobileView');

function initAdtechTags() {
    /*if (banner_category_top) {
        ADTECH.enqueueAd(Number(banner_category_top));
    }
    if (banner_post_top) {
        ADTECH.enqueueAd(Number(banner_post_top));
    }
    if (banner_post_n_first) {
        ADTECH.enqueueAd(Number(banner_post_n_first));
    }
    if (banner_post_n_second) {
        ADTECH.enqueueAd(Number(banner_post_n_second));
    }*/

    ADTECH.executeQueue();
}

// On each page change, the child is removed and elements part of Adsense's googleads are removed/undefined.
function changePage() {
    initAdtechTags();
}

function oldPluginCode() {
    PageTracker.current().on('change', changePage);
}

function watchPageChanges(api) {
    api.onPageChange(changePage);
}
withPluginApi('0.1', watchPageChanges, { noApi: oldPluginCode });

var data = {
    "topic-list-top" : {},
    "topic-above-post-stream" : {},
    "topic-above-suggested" : {},
    "post-bottom" : {},
    "post-bottom-second" : {}
};

if (banner_category_top || banner_post_top || banner_post_n_first || banner_post_n_second || banner_post_bottom) {
    if (banner_category_top) {
        data["topic-list-top"]["ad_code"] = banner_category_top;
    }
    if (banner_post_top) {
        data["topic-above-post-stream"]["ad_code"] = banner_post_top;
    }
    if (banner_post_n_first) {
        data["post-bottom"]["ad_code"] = banner_post_n_first;
    }
    if (banner_post_n_second) {
        data["post-bottom-second"]["ad_code"] = banner_post_n_second;
    }
    if (banner_post_bottom) {
        data["topic-above-suggested"]["ad_code"] = banner_post_bottom;
    }
}

export default Ember.Component.extend({
    classNames: ['adtech-ad'],
    //loadedGoogletag: false,

    init: function() {
        this.set('ad_code', data[this.placement]["ad_code"] );
        ADTECH.enqueueAd(Number(data[this.placement]["ad_code"]));
        this._super();
    },

    didInsertElement: function() {
        initAdtechTags();
    },

    checkTrustLevels: function() {
        return !((currentUser) && (currentUser.get('trust_level') > Discourse.SiteSettings.adtech_through_trust_level));
    }.property('trust_level'),
});
