import { withPluginApi } from 'discourse/lib/plugin-api';
import PageTracker from 'discourse/lib/page-tracker';

var ad_width = '';
var ad_height = '';
var ad_mobile_width = 320;
var ad_mobile_height = 50;
var currentUser = Discourse.User.current();
var mobile_width = 320;
var mobile_height = 50;

var banner_category_top = Discourse.SiteSettings.adtech_category_top_code;
var banner_post_top = Discourse.SiteSettings.adtech_post_top_code;
var banner_post_n_first = Discourse.SiteSettings.adtech_post_n_first_code;
var banner_post_n_second = Discourse.SiteSettings.adtech_post_n_second_code;

const mobileView = Discourse.Site.currentProp('mobileView');

function initAdtechTags() {
    // sto enqueueAd i parametros einai number, ama valw to var banner_category_top pou einai string den doulevei!! opote prepei na to metatrepsw!!
    //ADTECH.enqueueAd(6232308);
    ADTECH.enqueueAd(Number(banner_category_top));

    ADTECH.executeQueue();
}

// On each page change, the child is removed and elements part of Adsense's googleads are removed/undefined.
function changePage() {
    initAdtechTags();
    //alert('alert alert alert!');
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
    "post-bottom" : {}
};

if (banner_category_top || banner_post_top || banner_post_n_first || banner_post_n_second) {
    if (banner_category_top) {
        data["topic-list-top"]["ad_code"] = banner_category_top;
    }
    if (banner_post_top) {
        data["topic-above-post-stream"]["ad_code"] = banner_post_top;
    }
    if (banner_post_n_first) {
        data["post-bottom1"]["ad_code"] = banner_post_n_first;
    }
    if (banner_post_n_second) {
        data["post-bottom2"]["ad_code"] = banner_post_n_second;
    }
}

export default Ember.Component.extend({
    classNames: ['adtech-ad'],
    //loadedGoogletag: false,

    ad_width: ad_width,
    ad_height: ad_height,
    ad_mobile_width: ad_mobile_width,
    ad_mobile_height: ad_mobile_height,

    mobile_width: mobile_width,
    mobile_height: mobile_height,

    init: function() {
        this.set('ad_code', data[this.placement]["ad_code"] );
        initAdtechTags();
        this._super();
    },

    didInsertElement: function() {
        //initAdtechTags();
    },

    checkTrustLevels: function() {
        return !((currentUser) && (currentUser.get('trust_level') > Discourse.SiteSettings.adtech_through_trust_level));
    }.property('trust_level'),
});
