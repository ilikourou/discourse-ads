import { withPluginApi } from 'discourse/lib/plugin-api';
import PageTracker from 'discourse/lib/page-tracker';

var ad_width = '';
var ad_height = '';
var ad_mobile_width = 320;
var ad_mobile_height = 50;
var currentUser = Discourse.User.current();
var mobile_width = 320;
var mobile_height = 50;

var banner_topic_list_top = Discourse.SiteSettings.adtech_topic_list_top_code;

const mobileView = Discourse.Site.currentProp('mobileView');

function initAdtechTags() {
    ADTECH.enqueueAd(6232308);

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

if (banner_topic_list_top) {
    if (!mobileView && Discourse.SiteSettings.adtech_topic_list_top_code) {
        data["topic-list-top"]["ad_code"] = banner_topic_list_top;
    }
    if (mobileView && Discourse.SiteSettings.adtech_mobile_topic_list_top_code) {
        data["topic-list-top"]["ad_mobile_code"] = Discourse.SiteSettings.adtech_topic_list_top_code;
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
        /*this.set('ad_width', data[this.placement]["ad_width"] );
        this.set('ad_height', data[this.placement]["ad_height"] );*/
        this.set('ad_code', data[this.placement]["ad_code"] );
        this.set('ad_mobile_code', data[this.placement]["ad_mobile_code"] );
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
