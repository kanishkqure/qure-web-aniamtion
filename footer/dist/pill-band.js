"use strict";
var QurePillBand = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // footer/src/pill-band.ts
  var pill_band_exports = {};
  __export(pill_band_exports, {
    BandModel: () => BandModel,
    DEFAULT_CONFIG: () => DEFAULT_CONFIG,
    FIGMA_BAND: () => FIGMA_BAND,
    createPillBand: () => createPillBand,
    drawBand: () => drawBand
  });

  // footer/src/figma-band.ts
  var FIGMA_BAND = {
    frame: {
      width: 1440,
      height: 645
    },
    bandClip: {
      y0: 294.799,
      y1: 462.799
    },
    leftFrameClip: {
      x0: -671,
      x1: 151
    },
    rightFrameClip: {
      x0: 610,
      x1: 1432
    },
    logo: {
      x: 173,
      y: 307.799,
      w: 415,
      h: 141.707
    },
    tagline: {
      x: 730,
      y: 338.601,
      w: 421,
      h: 76,
      text: "Connecting care from detection to intervention."
    },
    pillHeight: 7.05,
    pillRadius: 3.525,
    unit: 13.123,
    minGap: 4.372,
    rowPitch: 15.933,
    layerOpacity: 0.17,
    peachColor: "#FF6D61",
    peachCount: 8,
    visiblePillCount: 250,
    lavenderTintCount: 49,
    rows: [
      {
        left: {
          cy: 307.198,
          segs: [
            [-421.937, 17.286, 5.147, "#D5CEE9", 0.46],
            [-399.008, 17.568, 7.05, "#CDC6E4", 0.54],
            [-371.211, 20.955, 7.05, "#C2BADC", 0.63],
            [-331.203, 19.332, 7.05, "#C8C0E0", 0.58],
            [-281.25, 18.838, 7.05, "#C7C0E0", 0.59],
            [-248.937, 21.026, 7.05, "#CAC2E1", 0.57],
            [-214.789, 19.332, 7.05, "#CAC3E2", 0.57],
            [-144.164, 18.415, 7.05, "#CBC3E2", 0.56],
            [-109.305, 15.452, 7.05, "#CAC3E2", 0.56],
            [5.766, 13.264, 7.05, "#CCC5E3", 0.55],
            [28.914, 16.933, 7.05, "#C6BFDF", 0.6],
            [50.43, 19.05, 7.05, "#C2BBDC", 0.62],
            [74.914, 14.605, 7.05, "#C3BBDD", 0.62],
            [104.547, 18.415, 7.05, "#C1B9DB", 0.63],
            [128.391, 20.32, 7.05, "#BFB7DA", 0.65]
          ]
        },
        right: {
          cy: 307.198,
          segs: [
            [612.289, 20.32, 7.05, "#BFB7DA", 0.65],
            [638.038, 18.415, 7.05, "#C1B9DB", 0.63],
            [671.481, 14.605, 7.05, "#C3BBDD", 0.62],
            [691.52, 19.05, 7.05, "#C2BBDC", 0.62],
            [715.153, 16.933, 7.05, "#C6BFDF", 0.6],
            [741.97, 13.264, 7.05, "#CCC5E3", 0.55],
            [854.853, 15.452, 7.05, "#CAC3E2", 0.56],
            [886.749, 18.415, 7.05, "#CBC3E2", 0.56],
            [956.457, 19.332, 7.05, "#CAC3E2", 0.57],
            [988.912, 21.026, 7.05, "#CAC2E1", 0.57],
            [1023.412, 18.838, 7.05, "#C7C0E0", 0.59],
            [1072.871, 19.332, 7.05, "#C8C0E0", 0.58],
            [1111.256, 20.955, 7.05, "#C2BADC", 0.63],
            [1142.439, 17.568, 7.05, "#CDC6E4", 0.54],
            [1165.651, 17.286, 5.147, "#D5CEE9", 0.46]
          ]
        }
      },
      {
        left: {
          cy: 323.134,
          segs: [
            [-648.633, 18.486, 3.807, "#D8D1EB", 0.41],
            [-447.406, 15.875, 4.653, "#D7CFEA", 0.44],
            [-399.922, 21.661, 7.05, "#BEB6D9", 0.65],
            [-372.687, 16.439, 7.05, "#C6BFDF", 0.59],
            [-300.656, 18.062, 7.05, "#C4BCDD", 0.61],
            [-253.945, 19.544, 7.05, "#CAC3E2", 0.56],
            [-204.344, 16.581, 7.05, "#CAC2E1", 0.57],
            [-169.281, 13.123, 7.05, "#C9C2E1", 0.57],
            [-151.711, 17.921, 7.05, "#C9C2E1", 0.57],
            [-118.687, 19.403, 7.05, "#CAC2E1", 0.57],
            [-94.07, 20.743, 7.05, "#CAC3E2", 0.57],
            [-60.484, 19.897, 7.05, "#CAC2E1", 0.57],
            [-31.414, 18.556, 7.05, "#C7BFDF", 0.59],
            [3.938, 18.133, 7.05, "#C8C1E0", 0.58],
            [30.813, 14.393, 7.05, "#C6BEDF", 0.6],
            [50.922, 21.661, 7.05, "#C5BDDE", 0.61],
            [85.211, 20.673, 7.05, "#C2BADC", 0.63],
            [114.422, 17.498, 7.05, "#C2BADC", 0.62]
          ]
        },
        right: {
          cy: 323.134,
          segs: [
            [629.08, 17.498, 7.05, "#C2BADC", 0.62],
            [655.116, 20.673, 7.05, "#C2BADC", 0.63],
            [688.418, 21.661, 7.05, "#C5BDDE", 0.61],
            [715.794, 14.393, 7.05, "#C6BEDF", 0.6],
            [738.93, 18.133, 7.05, "#C8C1E0", 0.58],
            [773.858, 18.556, 7.05, "#C7BFDF", 0.59],
            [801.588, 19.897, 7.05, "#CAC2E1", 0.57],
            [834.327, 20.743, 7.05, "#CAC3E2", 0.57],
            [860.285, 19.403, 7.05, "#CAC2E1", 0.57],
            [894.79, 17.921, 7.05, "#C9C2E1", 0.57],
            [917.158, 13.123, 7.05, "#C9C2E1", 0.57],
            [948.763, 16.581, 7.05, "#FF6D61", 1],
            [995.401, 19.544, 7.05, "#CAC3E2", 0.56],
            [1043.594, 18.062, 7.05, "#C4BCDD", 0.61],
            [1117.248, 16.439, 7.05, "#C6BFDF", 0.59],
            [1139.261, 21.661, 7.05, "#BEB6D9", 0.65],
            [1192.531, 15.875, 4.653, "#D7CFEA", 0.44],
            [1391.147, 18.486, 3.807, "#D8D1EB", 0.41]
          ]
        }
      },
      {
        left: {
          cy: 339.067,
          segs: [
            [-561.852, 14.252, 4.371, "#D7D0EB", 0.43],
            [-473.164, 13.899, 6.204, "#D1CAE6", 0.51],
            [-454.469, 16.792, 7.05, "#CDC6E4", 0.54],
            [-431.891, 14.464, 7.05, "#C1B9DB", 0.63],
            [-393.578, 15.452, 7.05, "#C4BCDD", 0.61],
            [-372.906, 19.685, 7.05, "#BCB4D8", 0.66],
            [-348.633, 17.568, 7.05, "#C1B9DB", 0.63],
            [-325.844, 21.943, 7.05, "#C0B9DB", 0.63],
            [-269.539, 17.357, 7.05, "#C9C1E0", 0.58],
            [-222.687, 20.038, 7.05, "#CBC3E2", 0.56],
            [-190.867, 18.203, 7.05, "#CAC3E2", 0.56],
            [-128.008, 15.24, 7.05, "#CAC2E1", 0.57],
            [-88.914, 20.249, 7.05, "#CBC3E2", 0.56],
            [-57.875, 20.038, 7.05, "#CCC4E3", 0.55],
            [-32.469, 15.381, 7.05, "#C9C1E1", 0.57],
            [15.508, 19.967, 7.05, "#C8C1E0", 0.58],
            [48.172, 17.639, 7.05, "#FF6D61", 1],
            [70.328, 19.544, 7.05, "#C7C0E0", 0.59],
            [111.109, 15.311, 7.05, "#C5BEDE", 0.6],
            [138.344, 20.391, 7.05, "#C4BCDD", 0.61]
          ]
        },
        right: {
          cy: 339.067,
          segs: [
            [602.266, 20.391, 7.05, "#C4BCDD", 0.61],
            [634.58, 15.311, 7.05, "#C5BEDE", 0.6],
            [671.128, 19.544, 7.05, "#C7C0E0", 0.59],
            [695.189, 17.639, 7.05, "#C6BEDE", 0.6],
            [725.525, 19.967, 7.05, "#C8C1E0", 0.58],
            [778.088, 15.381, 7.05, "#C9C1E1", 0.57],
            [798.837, 20.038, 7.05, "#CCC4E3", 0.55],
            [829.665, 20.249, 7.05, "#CBC3E2", 0.56],
            [873.768, 15.24, 7.05, "#CAC2E1", 0.57],
            [933.664, 18.203, 7.05, "#CAC3E2", 0.56],
            [963.65, 20.038, 7.05, "#CBC3E2", 0.56],
            [1013.182, 17.357, 7.05, "#C9C1E0", 0.58],
            [1064.901, 21.943, 7.05, "#C0B9DB", 0.63],
            [1092.064, 17.568, 7.05, "#C1B9DB", 0.63],
            [1114.221, 19.685, 7.05, "#BCB4D8", 0.66],
            [1139.126, 15.452, 7.05, "#C4BCDD", 0.61],
            [1178.427, 14.464, 7.05, "#C1B9DB", 0.63],
            [1198.677, 16.792, 7.05, "#CDC6E4", 0.54],
            [1220.265, 13.899, 6.204, "#D1CAE6", 0.51],
            [1308.599, 14.252, 4.371, "#D7D0EB", 0.43]
          ]
        }
      },
      {
        left: {
          cy: 354.998,
          segs: [
            [-601.43, 15.452, 5.147, "#D5CEE9", 0.46],
            [-522.977, 15.663, 7.05, "#C4BCDD", 0.61],
            [-490.516, 22.225, 7.05, "#BCB4D8", 0.66],
            [-456.016, 20.461, 7.05, "#BCB4D8", 0.66],
            [-403.102, 18.274, 7.05, "#C3BCDD", 0.61],
            [-343.414, 20.532, 7.05, "#BEB6D9", 0.65],
            [-291.766, 15.946, 7.05, "#C3BBDD", 0.62],
            [-270.242, 17.004, 7.05, "#C7C0E0", 0.59],
            [-231.086, 18.838, 7.05, "#CAC2E1", 0.57],
            [-206.531, 13.406, 7.05, "#CAC2E1", 0.57],
            [-188.117, 18.133, 7.05, "#CAC2E1", 0.57],
            [-155.102, 18.415, 7.05, "#CAC2E1", 0.57],
            [-79.32, 15.946, 7.05, "#CAC3E2", 0.57],
            [-58.367, 17.004, 7.05, "#CBC3E2", 0.56],
            [-28.875, 13.335, 7.05, "#CBC3E2", 0.56],
            [-10.461, 20.814, 7.05, "#C8C1E0", 0.58],
            [23.617, 17.78, 7.05, "#C8C0E0", 0.58],
            [91.563, 16.792, 7.05, "#FF6D61", 1],
            [113.086, 21.237, 7.05, "#C6BEDF", 0.6],
            [139.75, 17.074, 7.05, "#C6BEDF", 0.6]
          ]
        },
        right: {
          cy: 354.998,
          segs: [
            [604.176, 17.074, 7.05, "#C6BEDF", 0.6],
            [626.677, 21.237, 7.05, "#C6BEDF", 0.6],
            [652.645, 16.792, 7.05, "#C6BFDF", 0.59],
            [719.603, 17.78, 7.05, "#C8C0E0", 0.58],
            [750.647, 20.814, 7.05, "#C8C1E0", 0.58],
            [776.54, 13.335, 7.05, "#CBC3E2", 0.56],
            [802.363, 17.004, 7.05, "#CBC3E2", 0.56],
            [824.375, 15.946, 7.05, "#CAC3E2", 0.57],
            [897.687, 18.415, 7.05, "#CAC2E1", 0.57],
            [930.984, 18.133, 7.05, "#CAC2E1", 0.57],
            [954.126, 13.406, 7.05, "#CAC2E1", 0.57],
            [973.248, 18.838, 7.05, "#CAC2E1", 0.57],
            [1014.238, 17.004, 7.05, "#C7C0E0", 0.59],
            [1036.82, 15.946, 7.05, "#C3BBDD", 0.62],
            [1083.882, 20.532, 7.05, "#BEB6D9", 0.65],
            [1145.828, 18.274, 7.05, "#C3BCDD", 0.61],
            [1196.555, 20.461, 7.05, "#BCB4D8", 0.66],
            [1229.291, 22.225, 7.05, "#BCB4D8", 0.66],
            [1268.313, 15.663, 7.05, "#C4BCDD", 0.61],
            [1346.978, 15.452, 5.147, "#D5CEE9", 0.46]
          ]
        }
      },
      {
        left: {
          cy: 370.933,
          segs: [
            [-564.32, 14.534, 7.05, "#BCB4D8", 0.66],
            [-525.375, 15.663, 7.05, "#BDB5D9", 0.65],
            [-504.133, 22.931, 7.05, "#B8B0D5", 0.68],
            [-451.43, 16.933, 7.05, "#C4BCDD", 0.61],
            [-422.219, 18.627, 7.05, "#C3BBDD", 0.62],
            [-370.148, 19.544, 7.05, "#C2BBDC", 0.62],
            [-345.172, 15.875, 7.05, "#C1B9DB", 0.63],
            [-323.586, 15.169, 7.05, "#C3BBDC", 0.62],
            [-297.125, 14.746, 7.05, "#C4BDDE", 0.61],
            [-268.336, 13.264, 7.05, "#C8C0E0", 0.58],
            [-237.086, 16.863, 7.05, "#C9C1E1", 0.58],
            [-181.977, 16.298, 7.05, "#CAC3E2", 0.57],
            [-153.898, 16.369, 7.05, "#CAC2E1", 0.57],
            [-119.75, 18.486, 7.05, "#CAC3E2", 0.57],
            [-96.75, 21.026, 7.05, "#CBC3E2", 0.56],
            [-70.43, 20.743, 7.05, "#CAC3E2", 0.56],
            [-1.5, 13.547, 7.05, "#C9C2E1", 0.57],
            [56.992, 17.709, 7.05, "#C9C1E1", 0.58],
            [102.5, 19.262, 7.05, "#C9C1E0", 0.58],
            [134.109, 15.24, 7.05, "#C8C0E0", 0.58]
          ]
        },
        right: {
          cy: 370.933,
          segs: [
            [611.651, 15.24, 7.05, "#C8C0E0", 0.58],
            [639.238, 19.262, 7.05, "#C9C1E0", 0.58],
            [686.298, 17.709, 7.05, "#C9C1E1", 0.58],
            [748.953, 13.547, 7.05, "#C9C2E1", 0.57],
            [810.686, 20.743, 7.05, "#CAC3E2", 0.56],
            [836.724, 21.026, 7.05, "#CBC3E2", 0.56],
            [862.264, 18.486, 7.05, "#CAC3E2", 0.57],
            [898.529, 16.369, 7.05, "#CAC2E1", 0.57],
            [926.678, 16.298, 7.05, "#CAC3E2", 0.57],
            [981.223, 16.863, 7.05, "#C9C1E1", 0.58],
            [1016.071, 13.264, 7.05, "#C8C0E0", 0.58],
            [1043.379, 14.746, 7.05, "#C4BDDE", 0.61],
            [1069.416, 15.169, 7.05, "#C3BBDC", 0.62],
            [1090.297, 15.875, 7.05, "#C1B9DB", 0.63],
            [1111.605, 19.544, 7.05, "#C2BBDC", 0.62],
            [1164.592, 18.627, 7.05, "#C3BBDD", 0.62],
            [1195.496, 16.933, 7.05, "#C4BCDD", 0.61],
            [1242.202, 22.931, 7.05, "#B8B0D5", 0.68],
            [1270.712, 15.663, 7.05, "#BDB5D9", 0.65],
            [1310.786, 14.534, 7.05, "#FF6D61", 1]
          ]
        }
      },
      {
        left: {
          cy: 386.866,
          segs: [
            [-673.469, 18.909, 7.05, "#BBB3D7", 0.67],
            [-650.187, 16.933, 7.05, "#BEB6D9", 0.65],
            [-627.469, 14.041, 7.05, "#C6BFDF", 0.59],
            [-558.82, 21.449, 7.05, "#BFB7DA", 0.64],
            [-518.883, 18.486, 7.05, "#C0B9DB", 0.63],
            [-480.57, 17.357, 7.05, "#C1B9DB", 0.63],
            [-458.203, 20.884, 7.05, "#C3BBDD", 0.62],
            [-431.75, 21.661, 7.05, "#C2BADC", 0.62],
            [-392.937, 14.323, 7.05, "#C2BADC", 0.62],
            [-359.5, 13.617, 7.05, "#C3BCDD", 0.61],
            [-341.227, 14.887, 7.05, "#C3BBDD", 0.62],
            [-321.187, 13.829, 7.05, "#C4BCDD", 0.61],
            [-294.164, 14.393, 7.05, "#C5BDDE", 0.61],
            [-248.937, 16.51, 7.05, "#C6BEDF", 0.6],
            [-204.555, 18.486, 7.05, "#CAC2E1", 0.57],
            [-118.977, 17.286, 7.05, "#C9C2E1", 0.57],
            [0.477, 19.473, 7.05, "#CAC2E1", 0.57],
            [25.734, 13.758, 7.05, "#CAC2E1", 0.57],
            [62.563, 21.167, 7.05, "#C9C1E1", 0.58],
            [139.398, 15.734, 7.05, "#C7C0E0", 0.59]
          ]
        },
        right: {
          cy: 386.866,
          segs: [
            [605.868, 15.734, 7.05, "#C7C0E0", 0.59],
            [677.271, 21.167, 7.05, "#C9C1E1", 0.58],
            [721.507, 13.758, 7.05, "#CAC2E1", 0.57],
            [741.05, 19.473, 7.05, "#CAC2E1", 0.57],
            [862.69, 17.286, 7.05, "#C9C2E1", 0.57],
            [947.069, 18.486, 7.05, "#CAC2E1", 0.57],
            [993.427, 16.51, 7.05, "#C6BEDF", 0.6],
            [1040.771, 14.393, 7.05, "#C5BDDE", 0.61],
            [1068.359, 13.829, 7.05, "#C4BCDD", 0.61],
            [1087.339, 14.887, 7.05, "#C3BBDD", 0.62],
            [1106.883, 13.617, 7.05, "#C3BCDD", 0.61],
            [1139.615, 14.323, 7.05, "#C2BADC", 0.62],
            [1171.089, 21.661, 7.05, "#C2BADC", 0.62],
            [1198.319, 20.884, 7.05, "#C3BBDD", 0.62],
            [1224.214, 17.357, 7.05, "#C1B9DB", 0.63],
            [1261.397, 18.486, 7.05, "#C0B9DB", 0.63],
            [1298.371, 21.449, 7.05, "#BFB7DA", 0.64],
            [1374.428, 14.041, 7.05, "#C6BFDF", 0.59],
            [1394.254, 16.933, 7.05, "#BEB6D9", 0.65],
            [1415.56, 18.909, 7.05, "#BBB3D7", 0.67]
          ]
        }
      },
      {
        left: {
          cy: 402.799,
          segs: [
            [-679.047, 14.746, 7.05, "#C4BCDD", 0.61],
            [-647.078, 16.369, 7.05, "#C6BEDF", 0.6],
            [-596.914, 14.111, 7.05, "#C6BFDF", 0.59],
            [-574.766, 21.519, 7.05, "#C7BFDF", 0.59],
            [-547.953, 14.323, 7.05, "#C7BFDF", 0.59],
            [-527.844, 13.899, 7.05, "#C6BFDF", 0.59],
            [-425.328, 19.897, 7.05, "#C8C0E0", 0.58],
            [-370.578, 20.391, 7.05, "#CAC2E1", 0.57],
            [-313, 18.203, 7.05, "#CAC3E2", 0.57],
            [-274.687, 20.249, 7.05, "#C8C1E0", 0.58],
            [-245.547, 16.51, 7.05, "#C9C2E1", 0.57],
            [-208.578, 18.768, 7.05, "#C9C2E1", 0.57],
            [-171.398, 15.028, 7.05, "#CAC3E2", 0.57],
            [-146.914, 21.237, 7.05, "#CAC2E1", 0.57],
            [-93.859, 19.756, 7.05, "#CAC3E2", 0.57],
            [-69.023, 14.887, 7.05, "#CBC4E2", 0.56],
            [-42.773, 17.074, 7.05, "#CBC3E2", 0.56],
            [-20.336, 14.041, 7.05, "#CBC4E2", 0.56],
            [4.289, 16.016, 7.05, "#C9C2E1", 0.57],
            [25.172, 15.804, 7.05, "#CBC4E2", 0.56],
            [60.375, 15.24, 7.05, "#C0B8DB", 0.64],
            [133.125, 19.121, 7.05, "#C0B8DB", 0.64]
          ]
        },
        right: {
          cy: 402.799,
          segs: [
            [608.754, 19.121, 7.05, "#C0B8DB", 0.64],
            [685.385, 15.24, 7.05, "#C0B8DB", 0.64],
            [720.024, 15.804, 7.05, "#CBC4E2", 0.56],
            [740.695, 16.016, 7.05, "#C9C2E1", 0.57],
            [767.295, 14.041, 7.05, "#CBC4E2", 0.56],
            [786.699, 17.074, 7.05, "#CBC3E2", 0.56],
            [815.136, 14.887, 7.05, "#CBC4E2", 0.56],
            [835.104, 19.756, 7.05, "#CAC3E2", 0.57],
            [886.677, 21.237, 7.05, "#CAC2E1", 0.57],
            [917.37, 15.028, 7.05, "#CAC3E2", 0.57],
            [950.81, 18.768, 7.05, "#C9C2E1", 0.57],
            [990.037, 16.51, 7.05, "#C9C2E1", 0.57],
            [1015.438, 20.249, 7.05, "#C8C1E0", 0.58],
            [1055.797, 18.203, 7.05, "#CAC3E2", 0.57],
            [1111.188, 20.391, 7.05, "#CAC2E1", 0.57],
            [1166.431, 19.897, 7.05, "#C8C0E0", 0.58],
            [1274.944, 13.899, 7.05, "#C6BFDF", 0.59],
            [1294.63, 14.323, 7.05, "#C7BFDF", 0.59],
            [1314.246, 21.519, 7.05, "#C7BFDF", 0.59],
            [1343.803, 14.111, 7.05, "#C6BFDF", 0.59],
            [1391.709, 16.369, 7.05, "#C6BEDF", 0.6],
            [1425.301, 14.746, 7.05, "#C4BCDD", 0.61]
          ]
        }
      },
      {
        left: {
          cy: 418.732,
          segs: [
            [-671.211, 17.639, 7.05, "#C9C1E1", 0.58],
            [-602.633, 20.038, 7.05, "#C8C0E0", 0.58],
            [-486.852, 19.332, 7.05, "#C8C0E0", 0.59],
            [-431.32, 18.697, 7.05, "#C8C0E0", 0.58],
            [-395.766, 19.191, 7.05, "#C9C1E1", 0.57],
            [-352.375, 14.887, 7.05, "#CAC2E1", 0.57],
            [-326.969, 14.958, 7.05, "#CAC3E2", 0.57],
            [-262.344, 13.547, 7.05, "#CAC3E2", 0.56],
            [-244.352, 19.121, 7.05, "#CAC3E2", 0.57],
            [-193.266, 15.804, 7.05, "#CAC2E1", 0.57],
            [-157.141, 20.108, 7.05, "#C5BEDE", 0.6],
            [-93.781, 14.182, 7.05, "#C6BEDF", 0.6],
            [-51.172, 18.909, 7.05, "#C9C2E1", 0.57],
            [-21.469, 19.121, 7.05, "#C9C1E1", 0.57],
            [24.398, 13.97, 7.05, "#CAC2E1", 0.57],
            [44.008, 21.661, 7.05, "#A199C6", 0.81],
            [70.68, 19.121, 7.05, "#ADA4CD", 0.75],
            [112.445, 21.661, 7.05, "#FF6D61", 1],
            [139.188, 22.507, 7.05, "#AEA6CE", 0.74]
          ]
        },
        right: {
          cy: 418.732,
          segs: [
            [599.305, 22.507, 7.05, "#AEA6CE", 0.74],
            [626.894, 21.661, 7.05, "#B0A8D0", 0.73],
            [671.2, 19.121, 7.05, "#ADA4CD", 0.75],
            [695.332, 21.661, 7.05, "#A199C6", 0.81],
            [722.632, 13.97, 7.05, "#CAC2E1", 0.57],
            [763.348, 19.121, 7.05, "#C9C1E1", 0.57],
            [793.263, 18.909, 7.05, "#C9C2E1", 0.57],
            [840.6, 14.182, 7.05, "#C6BEDF", 0.6],
            [898.032, 20.108, 7.05, "#C5BEDE", 0.6],
            [938.461, 15.804, 7.05, "#CAC2E1", 0.57],
            [986.231, 19.121, 7.05, "#FF6D61", 1],
            [1009.797, 13.547, 7.05, "#FF6D61", 1],
            [1073.011, 14.958, 7.05, "#CAC3E2", 0.57],
            [1098.488, 14.887, 7.05, "#CAC2E1", 0.57],
            [1137.575, 19.191, 7.05, "#C9C1E1", 0.57],
            [1173.623, 18.697, 7.05, "#C8C0E0", 0.58],
            [1228.519, 19.332, 7.05, "#C8C0E0", 0.59],
            [1343.595, 20.038, 7.05, "#C8C0E0", 0.58],
            [1414.572, 17.639, 7.05, "#C9C1E1", 0.58]
          ]
        }
      },
      {
        left: {
          cy: 434.664,
          segs: [
            [-670.367, 16.439, 7.05, "#CAC2E1", 0.57],
            [-619.492, 15.946, 7.05, "#C8C0E0", 0.58],
            [-562.555, 14.041, 7.05, "#C7BFDF", 0.59],
            [-493.203, 15.099, 7.05, "#C7BFDF", 0.59],
            [-447.906, 15.028, 7.05, "#C9C1E1", 0.58],
            [-419.891, 16.51, 7.05, "#C9C1E1", 0.58],
            [-398.727, 20.108, 7.05, "#C7C0E0", 0.59],
            [-332.617, 14.041, 7.05, "#C9C2E1", 0.57],
            [-313.633, 20.814, 7.05, "#CAC3E2", 0.56],
            [-287.32, 14.393, 7.05, "#CCC4E3", 0.55],
            [-251.828, 19.826, 7.05, "#CAC2E1", 0.57],
            [-206.883, 14.041, 7.05, "#CAC3E2", 0.57],
            [-188.328, 14.252, 7.05, "#CAC2E1", 0.57],
            [-143.594, 19.544, 7.05, "#C6BEDF", 0.6],
            [-105.43, 18.838, 7.05, "#C7C0E0", 0.59],
            [-81.367, 21.096, 7.05, "#C7BFDF", 0.59],
            [-43.195, 20.461, 7.05, "#C9C2E1", 0.57],
            [7.18, 16.439, 7.05, "#C9C1E1", 0.58],
            [41.961, 15.522, 7.05, "#BBB3D7", 0.67],
            [63.344, 18.133, 7.05, "#ACA3CD", 0.75],
            [101.516, 15.593, 7.05, "#B1A8D0", 0.73],
            [122.328, 17.357, 7.05, "#B3ABD2", 0.71]
          ]
        },
        right: {
          cy: 434.664,
          segs: [
            [621.315, 17.357, 7.05, "#B3ABD2", 0.71],
            [643.892, 15.593, 7.05, "#B1A8D0", 0.73],
            [679.523, 18.133, 7.05, "#FF6D61", 1],
            [703.517, 15.522, 7.05, "#BBB3D7", 0.67],
            [737.381, 16.439, 7.05, "#C9C1E1", 0.58],
            [783.734, 20.461, 7.05, "#C9C2E1", 0.57],
            [821.271, 21.096, 7.05, "#C7BFDF", 0.59],
            [847.591, 18.838, 7.05, "#C7C0E0", 0.59],
            [885.05, 19.544, 7.05, "#C6BEDF", 0.6],
            [935.076, 14.252, 7.05, "#CAC2E1", 0.57],
            [953.842, 14.041, 7.05, "#CAC3E2", 0.57],
            [993.002, 19.826, 7.05, "#CAC2E1", 0.57],
            [1033.927, 14.393, 7.05, "#CCC4E3", 0.55],
            [1053.819, 20.814, 7.05, "#CAC3E2", 0.56],
            [1079.577, 14.041, 7.05, "#C9C2E1", 0.57],
            [1139.618, 20.108, 7.05, "#C7C0E0", 0.59],
            [1164.381, 16.51, 7.05, "#C9C1E1", 0.58],
            [1193.878, 15.028, 7.05, "#C9C1E1", 0.58],
            [1239.104, 15.099, 7.05, "#C7BFDF", 0.59],
            [1309.514, 14.041, 7.05, "#C7BFDF", 0.59],
            [1364.547, 15.946, 7.05, "#C8C0E0", 0.58],
            [1414.928, 16.439, 7.05, "#CAC2E1", 0.57]
          ]
        }
      },
      {
        left: {
          cy: 450.598,
          segs: [
            [-674.461, 15.593, 7.05, "#C8C0E0", 0.59],
            [-654.211, 18.133, 7.05, "#C6BEDF", 0.6],
            [-625.562, 15.593, 7.05, "#C6BEDF", 0.6],
            [-605.172, 15.381, 7.05, "#C6BFDF", 0.59],
            [-554.375, 17.074, 7.05, "#C6BEDF", 0.6],
            [-532.43, 19.826, 7.05, "#C4BCDD", 0.61],
            [-508.227, 21.237, 7.05, "#C5BDDE", 0.6],
            [-464.554, 21.731, 7.05, "#C4BCDD", 0.61],
            [-438.305, 16.651, 7.05, "#C7BFDF", 0.59],
            [-387.086, 13.899, 7.05, "#C7BFDF", 0.59],
            [-360.484, 18.627, 7.05, "#C7BFDF", 0.59],
            [-328.172, 18.627, 7.05, "#C8C0E0", 0.58],
            [-304.25, 17.78, 7.05, "#CBC3E2", 0.56],
            [-243.43, 14.111, 7.05, "#CAC3E2", 0.57],
            [-192.844, 14.464, 7.05, "#CAC2E1", 0.57],
            [-167.797, 14.182, 7.05, "#C8C1E0", 0.58],
            [-130.195, 15.946, 7.05, "#C5BDDE", 0.6],
            [-77.273, 17.074, 7.05, "#C8C0E0", 0.58],
            [-34.234, 21.096, 7.05, "#C9C1E1", 0.57],
            [-3.047, 14.958, 7.05, "#C8C0E0", 0.58],
            [39.352, 13.194, 7.05, "#CAC3E2", 0.56],
            [57.695, 16.298, 7.05, "#A89FCA", 0.78],
            [79.57, 24.271, 7.05, "#B2A9D1", 0.72],
            [121.977, 21.661, 7.05, "#B1A8D0", 0.73],
            [148.43, 16.439, 7.05, "#B1A8D0", 0.73]
          ]
        },
        right: {
          cy: 450.598,
          segs: [
            [596.131, 16.439, 7.05, "#B1A8D0", 0.73],
            [617.363, 21.661, 7.05, "#B1A8D0", 0.73],
            [657.159, 24.271, 7.05, "#B2A9D1", 0.72],
            [687.006, 16.298, 7.05, "#A89FCA", 0.78],
            [708.455, 13.194, 7.05, "#CAC3E2", 0.56],
            [749.089, 14.958, 7.05, "#C8C0E0", 0.58],
            [774.138, 21.096, 7.05, "#C9C1E1", 0.57],
            [821.199, 17.074, 7.05, "#C8C0E0", 0.58],
            [875.25, 15.946, 7.05, "#C5BDDE", 0.6],
            [914.615, 14.182, 7.05, "#C8C1E0", 0.58],
            [939.38, 14.464, 7.05, "#CAC2E1", 0.57],
            [990.319, 14.111, 7.05, "#CAC3E2", 0.57],
            [1047.47, 17.78, 7.05, "#CBC3E2", 0.56],
            [1070.545, 18.627, 7.05, "#C8C0E0", 0.58],
            [1102.858, 18.627, 7.05, "#C7BFDF", 0.59],
            [1134.186, 13.899, 7.05, "#C7BFDF", 0.59],
            [1182.654, 16.651, 7.05, "#C7BFDF", 0.59],
            [1203.823, 21.731, 7.05, "#C4BCDD", 0.61],
            [1247.989, 21.237, 7.05, "#C5BDDE", 0.6],
            [1273.604, 19.826, 7.05, "#C4BCDD", 0.61],
            [1298.301, 17.074, 7.05, "#C6BEDF", 0.6],
            [1350.791, 15.381, 7.05, "#C6BFDF", 0.59],
            [1370.97, 15.593, 7.05, "#C6BEDF", 0.6],
            [1397.078, 18.133, 7.05, "#C6BEDF", 0.6],
            [1419.868, 15.593, 7.05, "#C8C0E0", 0.59]
          ]
        }
      }
    ],
    logoZonePadX: 22,
    logoZonePadXRight: 22,
    rightInset: 8
  };

  // footer/src/band-model.ts
  var DEFAULT_CONFIG = {
    KEYFRAME_MS: 600,
    OP_RATIO: 0.25,
    PEACH_DRIFT: 0.85,
    INK_TOLERANCE: 0.1,
    UNIT: FIGMA_BAND.unit,
    GAP: FIGMA_BAND.minGap,
    MERGE_GAP: FIGMA_BAND.minGap * 2,
    MAX_W: FIGMA_BAND.unit * 2.5,
    PEACH_MIN_W: FIGMA_BAND.unit * 0.4,
    HOME_PULL: FIGMA_BAND.unit * 4,
    ZONE_PAD: FIGMA_BAND.logoZonePadX,
    RIGHT_INSET: FIGMA_BAND.rightInset,
    TAGLINE_CLEAR_ZONE: false,
    MOBILE_MAX: 799,
    BG: "#ffffff"
  };
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function parseHex(hex) {
    const h = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  function composite(fill, alpha, bg) {
    return [0, 1, 2].map((i) => bg[i] + (fill[i] - bg[i]) * alpha);
  }
  var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  var right = (s) => s.xb + s.wb;
  var EPS = 1e-6;
  var BandModel = class {
    constructor(layout, cfg = {}) {
      this.rows = [];
      this.nextId = 1;
      this.peachWidths = [];
      this.peachTarget = 0;
      this.pendingSpawns = 0;
      /** lavender pills asked to make way for a peach stuck behind them */
      this.yielders = /* @__PURE__ */ new Set();
      this.mobile = false;
      var _a;
      this.cfg = { ...DEFAULT_CONFIG, ...cfg };
      this.rng = mulberry32((_a = this.cfg.SEED) != null ? _a : Math.random() * 2 ** 32 >>> 0);
      this.bg = parseHex(this.cfg.BG);
      this.peachRGB = composite(parseHex(FIGMA_BAND.peachColor), FIGMA_BAND.layerOpacity, this.bg);
      this.build(layout);
    }
    get peachCount() {
      let n = 0;
      for (const r of this.rows) for (const l of r.lanes) for (const s of l.segs) if (s.peach && !s.dying) n++;
      return n;
    }
    // ---------------------------------------------------------------- layout
    /** Lay the Figma rows into the current band geometry. At 1440px this is the Figma frame exactly. */
    build(layout) {
      const c = this.cfg;
      this.mobile = layout.width <= c.MOBILE_MAX;
      this.rows = [];
      this.peachWidths = [];
      const figLogoCy = FIGMA_BAND.logo.y + FIGMA_BAND.logo.h / 2;
      const logoCy = (layout.logo.y0 + layout.logo.y1) / 2;
      const zoneL = layout.logo.x0 - c.ZONE_PAD;
      const zoneR = layout.logo.x1 + c.ZONE_PAD;
      const leftShift = zoneL - FIGMA_BAND.leftFrameClip.x1;
      const rightShift = zoneR - FIGMA_BAND.rightFrameClip.x0;
      const bandEnd = layout.width - c.RIGHT_INSET;
      const period = FIGMA_BAND.rightFrameClip.x1 - FIGMA_BAND.rightFrameClip.x0;
      const zones = [{ x0: zoneL, x1: zoneR, y0: -Infinity, y1: Infinity, strict: false }];
      if (c.TAGLINE_CLEAR_ZONE && layout.tagline) {
        const t = layout.tagline;
        zones.push({ x0: t.x0 - c.ZONE_PAD, x1: t.x1 + c.ZONE_PAD, y0: t.y0, y1: t.y1, strict: true });
      }
      FIGMA_BAND.rows.forEach((figRow, ri) => {
        var _a, _b;
        if (this.mobile && ri % 2) return;
        const cy = logoCy + (figRow.right.cy - figLogoCy);
        const half = FIGMA_BAND.pillHeight / 2;
        const src = [];
        for (let k = 0; zoneL - k * period > 1 || k === 0; k++) {
          for (const s of figRow.left.segs) src.push([s[0] + leftShift - k * period, s[1], s[2], s[3], s[4]]);
          if (k > 8) break;
        }
        for (let k = 0; zoneR + k * period < bandEnd - 1 || k === 0; k++) {
          for (const s of figRow.right.segs) src.push([s[0] + rightShift + k * period, s[1], s[2], s[3], s[4]]);
          if (k > 8) break;
        }
        src.sort((a, b) => a[0] - b[0]);
        const rowZones = zones.filter((z) => z.y0 < cy + half && z.y1 > cy - half).sort((a, b) => a.x0 - b.x0);
        const spans = [];
        let cursor = 0;
        for (const z of rowZones) {
          if (z.x0 > cursor) spans.push({ L: cursor, R: z.x0 });
          cursor = Math.max(cursor, z.x1);
        }
        if (bandEnd > cursor) spans.push({ L: cursor, R: bandEnd });
        const lanes = [];
        for (const sp of spans) {
          if (sp.R - sp.L < c.UNIT + 2 * c.GAP) continue;
          const segs = [];
          let lavIndex = 0;
          for (const s of src) {
            const [x, w, h, fill, alpha] = s;
            if (x + w <= sp.L || x >= sp.R) continue;
            if (rowZones.some((z) => z.strict && x < z.x1 && x + w > z.x0)) continue;
            const peach = fill.toUpperCase() === FIGMA_BAND.peachColor.toUpperCase();
            if (this.mobile && !peach && lavIndex++ % 2) continue;
            const prev = segs[segs.length - 1];
            if (prev && x < right(prev) + c.GAP - 0.01) continue;
            const col = composite(parseHex(fill), alpha * FIGMA_BAND.layerOpacity, this.bg);
            if (peach) this.peachWidths.push(w);
            segs.push(this.makeSeg(x, w, h, col, peach));
          }
          lanes.push({
            L: sp.L,
            R: sp.R,
            lb: Math.min(sp.L, (_b = (_a = segs[0]) == null ? void 0 : _a.xa) != null ? _b : sp.L),
            rb: Math.max(sp.R, segs.length ? right(segs[segs.length - 1]) : sp.R),
            segs,
            reserve: -Infinity,
            yieldEntry: false
          });
        }
        if (!lanes.length) return;
        const lav2 = lanes.flatMap((l) => l.segs.filter((s) => !s.peach));
        this.rows.push({ cy, lanes, inkTarget: lav2.reduce((a, s) => a + s.wa, 0), lavCount0: lav2.length });
      });
      if (!this.peachWidths.length) this.peachWidths = [FIGMA_BAND.unit];
      const present = this.peachCount;
      const lav = this.rows.reduce((n, r) => n + r.lavCount0, 0);
      const figLav = FIGMA_BAND.visiblePillCount - FIGMA_BAND.peachCount;
      this.peachTarget = Math.max(present, Math.max(1, Math.round(FIGMA_BAND.peachCount * lav / figLav)));
      this.pendingSpawns = this.peachTarget - present;
    }
    makeSeg(x, w, h, col, peach) {
      return {
        id: this.nextId++,
        peach,
        h,
        xa: x,
        wa: w,
        ca: col,
        oa: 1,
        xb: x,
        wb: w,
        cb: col,
        ob: 1,
        minW: peach ? this.cfg.PEACH_MIN_W : Math.min(this.cfg.UNIT, w),
        home: x,
        baseW: w,
        link: null,
        busy: false,
        dying: false,
        crossing: false
      };
    }
    // ------------------------------------------------------------- keyframes
    /** Finish the current tween (b becomes a) and plan the next keyframe. */
    advance() {
      this.commit();
      this.plan();
    }
    commit() {
      var _a, _b;
      for (const row of this.rows) {
        row.lanes.forEach((lane, li) => {
          const keep = [];
          for (const s of lane.segs) {
            if (s.dying) continue;
            if (s.crossing) {
              const next = row.lanes[li + 1];
              s.crossing = false;
              s.xb = next.L - s.wb;
              next.segs.unshift(s);
              continue;
            }
            keep.push(s);
          }
          lane.segs = keep;
        });
        for (const lane of row.lanes) {
          const out = [];
          for (const s of lane.segs) {
            s.xa = s.xb;
            s.wa = s.wb;
            s.ca = s.cb;
            s.oa = s.ob;
            s.busy = false;
            const prev = out[out.length - 1];
            if (((_a = prev == null ? void 0 : prev.link) == null ? void 0 : _a.to) === s && prev.link.kind === "merge") {
              prev.wa = prev.wb = right(s) - prev.xb;
              prev.minW = Math.min(prev.minW, s.minW);
              prev.link = null;
              continue;
            }
            if (((_b = prev == null ? void 0 : prev.link) == null ? void 0 : _b.to) === s) prev.link = null;
            out.push(s);
          }
          lane.segs = out.sort((a, b) => a.xa - b.xa);
          lane.reserve = -Infinity;
          lane.yieldEntry = false;
        }
      }
    }
    plan() {
      for (const row of this.rows) for (const lane of row.lanes) lane.segs.sort((a, b) => a.xb - b.xb);
      this.yielders.clear();
      this.planPeach();
      this.spawnPeach();
      for (const row of this.rows) this.planLavender(row);
    }
    // ------------------------------------------------------------------ peach
    planPeach() {
      const c = this.cfg;
      for (const row of this.rows) {
        for (let li = row.lanes.length - 1; li >= 0; li--) {
          const lane = row.lanes[li];
          const peaches = lane.segs.filter((s) => s.peach).sort((a, b) => b.xb - a.xb);
          for (const p of peaches) {
            if (p.oa < 1) continue;
            const step = this.rng() < c.PEACH_DRIFT ? c.UNIT * (this.rng() < 0.5 ? 1 : 2) : 0;
            const want = Math.max(p.xb + step, step ? lane.L : -Infinity);
            const isLast = li === row.lanes.length - 1;
            const leading = !lane.segs.some((s) => s.peach && s !== p && s.xb > p.xb);
            let exit = leading && want + p.wb > lane.R;
            if (!exit) {
              const moved = this.placePeach(lane, p, Math.min(want, lane.R - c.PEACH_MIN_W));
              if (moved || want <= p.xb + c.UNIT / 2) continue;
              const swap = this.swapTarget(lane, p);
              if (swap && swap.x1 <= lane.R) {
                this.swap(p, swap.seg);
                continue;
              }
              exit = leading && lane.R - right(p) < c.UNIT * 3;
              if (!exit) continue;
            }
            if (isLast) {
              p.dying = true;
              p.busy = true;
              p.xb = Math.max(p.xb, want);
              p.ob = 0;
              this.pendingSpawns++;
              continue;
            }
            const next = row.lanes[li + 1];
            const room = this.entryRoom(next);
            if (room >= Math.min(c.UNIT, p.baseW * 0.75)) {
              p.crossing = true;
              p.busy = true;
              p.xb = lane.R + c.GAP;
              next.reserve = next.L + p.baseW + c.GAP;
            } else {
              next.yieldEntry = true;
            }
          }
        }
      }
    }
    /** Free width at a lane's left entry, against both ends of every neighbour's tween. */
    entryRoom(lane) {
      if (lane.reserve > -Infinity || lane.segs.some((s) => s.peach && s.xb < lane.L)) return 0;
      const first = lane.segs.find((s) => s.xb + s.wb > lane.L || s.xa + s.wa > lane.L);
      if (!first) return lane.R - lane.L;
      return Math.min(first.xa, first.xb) - this.cfg.GAP - lane.L;
    }
    /** Put peach `p` in the first gap at or after `want` that fits it, shrinking if needed. */
    placePeach(lane, p, want) {
      const c = this.cfg;
      const others = lane.segs.filter((s) => s !== p && right(s) > lane.L && s.xb < lane.R);
      const gaps = [];
      let a = lane.L;
      for (const s of others) {
        const b = Math.min(s.xb, s.xa) - c.GAP;
        gaps.push({ a, b, own: p.xb >= a - EPS && right(p) <= b + EPS });
        if (s.peach && s.xb > p.xb) break;
        a = Math.max(right(s), s.xa + s.wa) + c.GAP;
      }
      if (!others.some((s) => s.peach && s.xb > p.xb)) gaps.push({ a, b: lane.R, own: p.xb >= a - EPS });
      const maxHop = c.UNIT * 3;
      const own = gaps.find((g) => g.own);
      const ahead = others.find((s) => s.xb > p.xb && !s.peach);
      const full = Math.min(p.baseW, p.wb + c.UNIT);
      const comfy = Math.max(c.PEACH_MIN_W, p.baseW * 0.6);
      let best = null;
      for (const g of gaps) {
        if (g.a - p.xb > maxHop) break;
        for (const [w, rank] of [[full, 0], [comfy, 1], [c.PEACH_MIN_W, 2]]) {
          if (g.b - g.a < w - EPS) continue;
          const x = Math.max(g.a, Math.min(want, g.b - w));
          if (x < p.xb - EPS || x - p.xb > maxHop) continue;
          const moved = want <= p.xb + EPS || x > p.xb + c.UNIT * 0.5;
          const score = (moved ? 0 : 10) + rank;
          if (!best || score < best.score) best = { x, w: Math.min(full, g.b - x), score };
          break;
        }
      }
      p.busy = true;
      if (best) {
        p.xb = best.x;
        p.wb = best.w;
      } else if (own) {
        p.wb = Math.min(full, own.b - p.xb);
      }
      if (ahead && p.wb < p.baseW - EPS) this.yielders.add(ahead);
      return !!best && best.score < 10;
    }
    /** The lavender pill directly in front of `p`, if it is free to trade places. */
    swapTarget(lane, p) {
      if (p.xb < Math.max(lane.L, lane.lb)) return null;
      const i = lane.segs.indexOf(p);
      const s = lane.segs.slice(i + 1).find((o) => o.xb > p.xb);
      if (!s || s.peach || s.busy || s.link || this.yielders.has(s)) return null;
      if (lane.segs.some((o) => {
        var _a;
        return ((_a = o.link) == null ? void 0 : _a.to) === s;
      })) return null;
      return { seg: s, x1: right(s) };
    }
    /**
     * Peach and the lavender pill in front exchange places over one keyframe, keeping the
     * gap between them: [p][gap][s] becomes [s][gap][p]. Ink and spacing are unchanged.
     */
    swap(p, s) {
      const gap = s.xb - right(p);
      const x0 = p.xb;
      const end = right(s);
      s.xb = x0;
      p.xb = x0 + s.wb + gap;
      p.wb = end - p.xb;
      s.busy = p.busy = true;
      this.yielders.delete(s);
    }
    spawnPeach() {
      const c = this.cfg;
      const need = Math.min(this.pendingSpawns, Math.max(0, this.peachTarget - this.peachCount));
      for (let n = 0; n < need; n++) {
        const baseW = this.peachWidths[Math.floor(this.rng() * this.peachWidths.length)];
        const minW = Math.max(c.PEACH_MIN_W, baseW * 0.6);
        const options = [];
        for (const row of this.rows) {
          const lane = row.lanes[0];
          if (lane.segs.some((s2) => s2.peach && s2.xb < lane.L + c.UNIT * 4)) continue;
          let a = lane.L + 1;
          for (const s2 of lane.segs) {
            const lo = Math.min(s2.xa, s2.xb);
            const hi = Math.max(s2.xa + s2.wa, right(s2));
            if (hi <= a) continue;
            if (lo - c.GAP - a >= minW) break;
            a = hi + c.GAP;
            if (a > lane.L + c.UNIT * 4) break;
          }
          if (a > lane.L + c.UNIT * 4) continue;
          const next = lane.segs.find((s2) => Math.max(s2.xa + s2.wa, right(s2)) > a);
          const room = (next ? Math.min(next.xa, next.xb) - c.GAP : lane.R) - a;
          if (room >= minW) options.push({ lane, x: a, w: Math.min(baseW, room) });
        }
        if (!options.length) {
          const row = this.rows[Math.floor(this.rng() * this.rows.length)];
          const first = row == null ? void 0 : row.lanes[0].segs.find((s2) => right(s2) > row.lanes[0].L);
          if (first && !first.peach) this.yielders.add(first);
          return;
        }
        const pick = options[Math.floor(this.rng() * options.length)];
        const s = this.makeSeg(pick.x, pick.w, FIGMA_BAND.pillHeight, this.peachRGB, true);
        s.baseW = baseW;
        s.oa = 0;
        s.busy = true;
        pick.lane.segs.push(s);
        pick.lane.segs.sort((a, b) => a.xb - b.xb);
        this.pendingSpawns--;
      }
    }
    // --------------------------------------------------------------- lavender
    rowInk(row) {
      let ink = 0;
      for (const l of row.lanes) for (const s of l.segs) if (!s.peach) ink += s.wb;
      return ink;
    }
    planLavender(row) {
      const c = this.cfg;
      const lo = row.inkTarget * (1 - c.INK_TOLERANCE);
      const hi = row.inkTarget * (1 + c.INK_TOLERANCE);
      let ink = this.rowInk(row);
      let count = row.lanes.reduce((n, l) => n + l.segs.filter((s) => !s.peach).length, 0);
      for (const lane of row.lanes) {
        lane.segs.sort((a, b) => a.xb - b.xb);
        if (lane.yieldEntry) {
          const first = lane.segs.find((s) => right(s) > lane.L);
          if (first) this.yielders.add(first);
        }
        for (const s of lane.segs) if (this.yielders.has(s)) ink -= this.makeWay(lane, s, ink - lo);
        for (const s of lane.segs.slice()) {
          if (s.peach || s.busy || this.rng() >= c.OP_RATIO) continue;
          const segs = lane.segs;
          const i = segs.indexOf(s);
          const prev = segs[i - 1];
          const next = segs[i + 1];
          const hidden = (n) => n && n.peach && (right(n) <= lane.L || n.xb >= lane.R);
          let leftLim = prev && !hidden(prev) ? Math.max(right(prev), prev.xa + prev.wa) + c.GAP : lane.lb;
          if (!prev && s.xb >= lane.reserve) leftLim = Math.max(leftLim, lane.reserve);
          const rightLim = next && !hidden(next) ? Math.min(next.xb, next.xa) - c.GAP : lane.rb;
          if (leftLim > s.xb + EPS || rightLim < right(s) - EPS) continue;
          const dev = (ink - row.inkTarget) / row.inkTarget / c.INK_TOLERANCE;
          const cdev = (count - row.lavCount0) / Math.max(4, row.lavCount0 * 0.15);
          const weights = {
            slide: 0.45,
            stretch: 0.2 * clamp(1 - dev, 0, 2),
            shrink: 0.2 * clamp(1 + dev, 0, 2),
            split: 0.08 * clamp(1 - cdev, 0, 2),
            merge: 0.08 * clamp(1 + cdev, 0, 2)
          };
          const op = this.pick(weights);
          if (op === "slide") {
            const pRight = clamp(0.5 + (s.home - s.xb) / (2 * c.HOME_PULL), 0.1, 0.9);
            const dist = c.UNIT * (this.rng() < 0.6 ? 1 : 2);
            const dx = this.rng() < pRight ? Math.min(dist, rightLim - right(s)) : -Math.min(dist, s.xb - leftLim);
            if (Math.abs(dx) >= 1) {
              s.xb += dx;
              s.busy = true;
            }
          } else if (op === "stretch") {
            const room = Math.min(c.UNIT, c.MAX_W - s.wb, hi - ink);
            const side = this.rng();
            let gl = side < 0.4 ? room : side < 0.8 ? 0 : room / 2;
            let gr = room - gl;
            gl = Math.min(gl, s.xb - leftLim);
            gr = Math.min(gr, rightLim - right(s));
            if (gl + gr >= 1) {
              s.xb -= gl;
              s.wb += gl + gr;
              ink += gl + gr;
              s.busy = true;
            }
          } else if (op === "shrink") {
            const d = Math.min(c.UNIT, s.wb - s.minW, ink - lo);
            if (d >= 1) {
              const side = this.rng();
              const fromLeft = side < 0.4 ? d : side < 0.8 ? 0 : d / 2;
              s.xb += fromLeft;
              s.wb -= d;
              ink -= d;
              s.busy = true;
            }
          } else if (op === "split") {
            const halfW = Math.max(c.UNIT, (s.wb - c.GAP) / 2);
            const span = halfW * 2 + c.GAP;
            const dInk = 2 * halfW - s.wb;
            if (rightLim - leftLim < span || ink + dInk > hi || ink + dInk < lo) continue;
            const x = clamp(s.xb + s.wb / 2 - span / 2, leftLim, rightLim - span);
            const b = this.makeSeg(s.xb + s.wb / 2, s.wb / 2, s.h, s.ca, false);
            b.minW = s.minW;
            s.wa = s.wb = s.wb / 2;
            s.xb = x;
            s.wb = halfW;
            s.busy = true;
            b.xb = x + halfW + c.GAP;
            b.wb = halfW;
            b.home = b.xb;
            b.busy = true;
            s.link = { to: b, kind: "split" };
            segs.splice(i + 1, 0, b);
            ink += dInk;
            count++;
          } else if (op === "merge") {
            if (!next || next.peach || next.busy || next.link) continue;
            const g = next.xb - right(s);
            const total = right(next) - s.xb;
            if (g > c.MERGE_GAP || total > c.MAX_W || ink + g > hi) continue;
            const mid = right(s) + g / 2;
            const col = s.wb >= next.wb ? s.ca : next.ca;
            s.wb = mid - s.xb;
            s.cb = col;
            s.busy = true;
            next.wb = right(next) - mid;
            next.xb = mid;
            next.cb = col;
            next.busy = true;
            s.link = { to: next, kind: "merge" };
            ink += g;
            count--;
          }
        }
      }
    }
    /**
     * A lavender pill makes way for a peach behind it: slide forward if there is room,
     * otherwise give up width at its back end (within the ink budget). Returns ink spent.
     */
    makeWay(lane, s, inkBudget) {
      const c = this.cfg;
      if (s.peach || s.busy) return 0;
      const i = lane.segs.indexOf(s);
      const next = lane.segs[i + 1];
      const rightLim = next ? Math.min(next.xb, next.xa) - c.GAP : lane.rb;
      const dx = Math.min(c.UNIT, rightLim - right(s));
      if (dx >= 1) {
        s.xb += dx;
        s.busy = true;
        return 0;
      }
      const d = Math.min(c.UNIT, s.wb - s.minW, inkBudget);
      if (d < 1) return 0;
      s.xb += d;
      s.wb -= d;
      s.busy = true;
      return d;
    }
    pick(w) {
      const keys = Object.keys(w);
      let r = this.rng() * keys.reduce((a, k) => a + w[k], 0);
      for (const k of keys) if ((r -= w[k]) <= 0) return k;
      return keys[0];
    }
  };

  // footer/src/pill-band.ts
  var lerp = (a, b, t) => a + (b - a) * t;
  var css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  function capsule(ctx, x, cy, w, h) {
    const r = Math.min(h / 2, w / 2);
    const y = cy - h / 2;
    if (ctx.roundRect) return ctx.roundRect(x, y, w, h, r);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, cy, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, cy, r, Math.PI / 2, 3 * Math.PI / 2);
    ctx.closePath();
  }
  function colourAt(s, t, bg) {
    const o = lerp(s.oa, s.ob, t);
    const c = s.ca === s.cb ? s.ca : [0, 1, 2].map((i) => lerp(s.ca[i], s.cb[i], t));
    if (o >= 1) return css(c);
    return css([0, 1, 2].map((i) => lerp(bg[i], c[i], o)));
  }
  function drawBand(ctx, model, t, height) {
    const bg = model.cfg.BG.replace("#", "");
    const bgRGB = [0, 2, 4].map((i) => parseInt(bg.slice(i, i + 2), 16));
    for (const row of model.rows) {
      for (const lane of row.lanes) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(lane.L, 0, lane.R - lane.L, height);
        ctx.clip();
        for (const pass of [false, true]) {
          for (const s of lane.segs) {
            if (s.peach !== pass) continue;
            const x = lerp(s.xa, s.xb, t);
            const w = lerp(s.wa, s.wb, t);
            if (w <= 0.01 || x > lane.R || x + w < lane.L) continue;
            ctx.fillStyle = colourAt(s, t, bgRGB);
            ctx.beginPath();
            capsule(ctx, x, row.cy, w, s.h);
            if (s.link) {
              const o = s.link.to;
              const ox = lerp(o.xa, o.xb, t);
              const hb = Math.min(s.h, o.h) * (s.link.kind === "merge" ? t : 1 - t);
              const r = s.h / 2;
              if (hb > 0.05) ctx.rect(x + w - r, row.cy - hb / 2, ox + r - (x + w - r), hb);
            }
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }
  }
  function relRect(el, origin) {
    const r = el.getBoundingClientRect();
    return { x0: r.left - origin.left, x1: r.right - origin.left, y0: r.top - origin.top, y1: r.bottom - origin.top };
  }
  function createPillBand(opts) {
    var _a;
    const { canvas, logo, tagline = null } = opts;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cssW = 0;
    let cssH = 0;
    let model;
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let onScreen = false;
    canvas.setAttribute("aria-hidden", "true");
    function measure() {
      const box = canvas.getBoundingClientRect();
      cssW = box.width;
      cssH = box.height;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(canvas.width / cssW || dpr, 0, 0, canvas.height / cssH || dpr, 0, 0);
      return {
        width: cssW,
        height: cssH,
        logo: relRect(logo, box),
        tagline: tagline ? relRect(tagline, box) : null
      };
    }
    function relayout() {
      const layout = measure();
      if (!model) model = new BandModel(layout, opts.config);
      else model.build(layout);
      elapsed = 0;
      render(0);
      sync();
    }
    function render(t) {
      ctx.clearRect(0, 0, cssW, cssH);
      drawBand(ctx, model, t, cssH);
    }
    function frame(now) {
      raf = 0;
      elapsed += Math.min(now - last, 250);
      last = now;
      const K = model.cfg.KEYFRAME_MS;
      while (elapsed >= K) {
        elapsed -= K;
        model.advance();
      }
      render(elapsed / K);
      sync();
    }
    function sync() {
      const run = onScreen && !document.hidden && !reduce.matches;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    const onReduce = () => {
      if (reduce.matches) relayout();
      else sync();
    };
    let lastW = -1;
    let lastH = -1;
    const ro = new ResizeObserver(() => {
      const b = canvas.getBoundingClientRect();
      if (Math.abs(b.width - lastW) < 0.5 && Math.abs(b.height - lastH) < 0.5) return;
      lastW = b.width;
      lastH = b.height;
      relayout();
    });
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    relayout();
    ro.observe(canvas);
    ro.observe(logo);
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", onReduce);
    (_a = document.fonts) == null ? void 0 : _a.ready.then(() => relayout());
    return {
      get model() {
        return model;
      },
      relayout,
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", sync);
        reduce.removeEventListener("change", onReduce);
      }
    };
  }
  return __toCommonJS(pill_band_exports);
})();
