import loadScript from 'discourse/lib/load-script';

var _loaded = false,
    _promise = null,
    currentUser = Discourse.User.current();

var banner_category_top = Discourse.SiteSettings.adtech_category_top_code;
var banner_post_top = Discourse.SiteSettings.adtech_post_top_code;
var banner_post_n_first = Discourse.SiteSettings.adtech_post_n_first_code;
var banner_post_n_second = Discourse.SiteSettings.adtech_post_n_second_code;
var banner_post_bottom = Discourse.SiteSettings.adtech_post_bottom_code;

const mobileView = Discourse.Site.currentProp('mobileView');

function loadAdtech() {
    if (_loaded) {
        return Ember.RSVP.resolve();
    }

    if (_promise) {
        return _promise;
    }

    var adtechSrc = (('https:' === document.location.protocol) ? 'https:' : 'http:') + '//aka-cdn-ns.adtech.de/dt/common/DAC.js';
    _promise = loadScript(adtechSrc, { scriptTag: true }).then(function() {
        _loaded = true;
    });

    return _promise;
}

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
    classNameBindings: [':adtech-ad', 'classForSlot'],

    adRequested: false,

    init() {
        this.set('ad_code', data[this.placement]["ad_code"] );
        /*if (typeof ADTECH !== 'undefined') { //we check if ADTECH var is defined (and not removed by Adblock)
            ADTECH.enqueueAd(Number(data[this.placement]["ad_code"]));
        }*/
        this._super();
    },

    _triggerAds() {
        this.set('adRequested', true);
        loadAdtech().then(function() {
            if (typeof ADTECH !== 'undefined') {
                ADTECH.loadAd(Number(get('ad_code')));
            }
        });
    },

    didInsertElement() {
        this._super();

        if (!this.get('showAd')) { return; }

        if (this.get('listLoading')) { return; }

        Ember.run.scheduleOnce('afterRender', this, this._triggerAds);
    },

    waitForLoad: function() {
        if (this.get('adRequested')) { return; } // already requested that this ad unit be populated
        if (!this.get('listLoading')) {
            Ember.run.scheduleOnce('afterRender', this, this._triggerAds);
        }
    }.observes('listLoading'),

    isResponsive: function() {
        return this.get('ad_width') === 'auto';
    }.property('ad_width'),

    checkTrustLevels: function() {
        return !((currentUser) && (currentUser.get('trust_level') > Discourse.SiteSettings.adtech_through_trust_level));
    }.property('trust_level'),

    showAd: function() {
        return Discourse.SiteSettings.adtech_post_n_first_code && this.get('checkTrustLevels');
    }.property('checkTrustLevels')
});
