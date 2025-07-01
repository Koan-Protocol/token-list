const { version } = require("../../package.json");
const { sortTokens } = require("../utils/builder");
const base_sepoli = require("../tokens/base-sepolia.json");
const lisk_sepolia = require("../tokens/lisk-sepolia.json");
const base = require("../tokens/base.json");

module.exports = function buildList() {
  const parsed = version.split(".");
  return {
    name: "Koan Protocol TokenList",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI:
      "https://raw.githubusercontent.com/koan-protocol/tokenlist/list/logos/koanlogo-256x256.png",
    keywords: ["Koanprotocol", "default"],
    tokens: sortTokens([...base_sepoli, ...lisk_sepolia, ...base]),
  };
};
