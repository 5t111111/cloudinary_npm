require('dotenv').load({
  silent: true,
});

const expect = require("expect.js");
const cloudinary = require("../cloudinary");

const { utils } = cloudinary;


function test_cloudinary_url(public_id, options, expected_url, expected_options) {
  const result = utils.url(public_id, options);
  expect(options).to.eql(expected_options);
  expect(result).to.eql(expected_url);
}

describe("Cloudinary::Utils for video", () => {
  beforeEach(() => {
    cloudinary.config({
      cloud_name: "test123",
      secure_distribution: null,
      private_cdn: false,
      secure: false,
      cname: null,
      cdn_subdomain: false,
      api_key: "1234",
      api_secret: "b",
    });
  });
  const root_path = "http://res.cloudinary.com/test123";
  const upload_path = `${root_path}/video/upload`;
  describe("utils.url", () => {
    describe(":video_codec", () => {
      it('Should support a string "auto"', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: 'auto',
        }, `${upload_path}/vc_auto/video_id`, {});
      });
      it('Should support a string "h264:basic:3.1"', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: 'h264:basic:3.1',
        }, `${upload_path}/vc_h264:basic:3.1/video_id`, {});
      });
      it('should support a hash value', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: {
            codec: 'h264',
            profile: 'basic',
            level: '3.1',
          },
        }, `${upload_path}/vc_h264:basic:3.1/video_id`, {});
      });
    });
    describe(":audio_codec", () => {
      it('should support a string value', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          audio_codec: 'acc',
        }, `${upload_path}/ac_acc/video_id`, {});
      });
    });
    describe(":bit_rate", () => {
      it('should support an integer value', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: 2048,
        }, `${upload_path}/br_2048/video_id`, {});
      });
      it('should support "<integer>k" ', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: '44k',
        }, `${upload_path}/br_44k/video_id`, {});
      });
      it('should support "<integer>m"', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: '1m',
        }, `${upload_path}/br_1m/video_id`, {});
      });
    });
    describe(":audio_frequency", () => {
      it('should support an integer value', () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          audio_frequency: 44100,
        }, `${upload_path}/af_44100/video_id`, {});
      });
    });
    describe(":video_sampling", () => {
      it("should support an integer value", () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_sampling: 20,
        }, `${upload_path}/vs_20/video_id`, {});
      });
      it("should support an string value in the a form of \"<float>s\"", () => {
        test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_sampling: "2.3s",
        }, `${upload_path}/vs_2.3s/video_id`, {});
      });
    });
    [
      ['so', 'start_offset'],
      ['eo', 'end_offset'],
      ['du', 'duration'],
    ].forEach(([short, long]) => {
      describe(`:${long}`, () => {
        it("should support decimal seconds ", () => {
          const op = {
            resource_type: 'video',
            [long]: 2.63,
          };
          test_cloudinary_url("video_id", op, `${upload_path}/${short}_2.63/video_id`, {});
        });
        it('should support percents of the video length as "<number>p"', () => {
          const op = {
            resource_type: 'video',
            [long]: '35p',
          };
          test_cloudinary_url("video_id", op, `${upload_path}/${short}_35p/video_id`, {});
        });
        it('should support percents of the video length as "<number>%"', () => {
          const op = {
            resource_type: 'video',
            [long]: '35%',
          };
          test_cloudinary_url("video_id", op, `${upload_path}/${short}_35p/video_id`, {});
        });
      });
    });
    describe(":offset", () => {
      [
        ['string range', 'so_2.66,eo_3.21', '2.66..3.21'],
        ['array', 'so_2.66,eo_3.21', [2.66, 3.21]],
        ['array of % strings', 'so_35p,eo_70p', ["35%", "70%"]],
        ['array of p strings', 'so_35p,eo_70p', ["35p", "70p"]],
        ['array of float percent', 'so_35.5p,eo_70.5p', ["35.5p", "70.5p"]],
      ].forEach(([name, url_param, range]) => {
        describe(`when provided with ${name} ${range}`, () => {
          it(`should produce a range transformation in the format of ${url_param}`, () => {
            const options = {
              resource_type: 'video',
              offset: range,
            };
            const url = utils.url("video_id", options);
            expect(options).to.eql({});
            const matched = /([^/]*)\/video_id$/.exec(url);
            const transformation = matched ? matched[1] : '';
            // we can't rely on the order of the parameters so we sort them before comparing
            expect(transformation.split(',').sort().reverse().join(',')).to.eql(url_param);
          });
        });
      });
      it('should support start_offset `auto`', () => {
        const op = {
          resource_type: 'video',
          start_offset: 'auto',
        };
        test_cloudinary_url("video_id", op, `${upload_path}/so_auto/video_id`, {});
      });
    });
    describe("when given existing relevant parameters: 'quality', :background, :crop, :width, :height, :gravity, :overlay", () => {
      [
        ['overlay', 'l'],
        ['underlay', 'u'],
      ].forEach(([param, letter]) => {
        it(`should support ${param}`, () => {
          const op = {
            resource_type: 'video',
            [param]: "text:hello",
          };
          test_cloudinary_url("test", op, `${upload_path}/${letter}_text:hello/test`, {});
        });
        it(`should not pass width/height to html for ${param}`, () => {
          const op = {
            resource_type: 'video',
            height: 100,
            width: 100,
            [param]: "text:hello",
          };
          test_cloudinary_url("test", op, `${upload_path}/h_100,${letter}_text:hello,w_100/test`, {});
        });
      });

      it("should produce the transformation string", () => {
        test_cloudinary_url("test", {
          resource_type: 'video',
          background: "#112233",
        }, `${upload_path}/b_rgb:112233/test`, {});
        test_cloudinary_url("test", {
          resource_type: 'video',
          x: 1,
          y: 2,
          radius: 3,
          gravity: 'center',
          quality: 0.4,
          prefix: "a",
        }, `${upload_path}/g_center,p_a,q_0.4,r_3,x_1,y_2/test`, {});
      });
    });
  });
  describe('cloudinary.video_thumbnail_url', () => {
    const source = "movie_id";
    const options = {
      cloud_name: "test123",
    };
    const path = utils.video_thumbnail_url(source, options);
    it("should generate a cloudinary URI to the video thumbnail", () => {
      expect(path).to.eql(`${upload_path}/movie_id.jpg`);
    });
  });
});
