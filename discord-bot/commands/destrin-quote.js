const Joi = require('joi');

const quotes = [
  "It'll fit, just relax Eviltek",
];
const argsSchema = Joi.array().ordered(
  Joi.number().integer().min(1).max(quotes.length).required(),
);

//eslint-disable-next-line no-unused-vars
function action(message, command, args) {
  if (command !== 'destrin-quote') return false;

  const validationResult = argsSchema.validate(args);
  if (validationResult.error) throw new Error(validationResult.error);
  const [index] = validationResult.value;

  message.channel.send(quotes[index - 1]);
  return true;
}

module.exports = {
  name: 'destrin-quote <index>',
  description: 'Posts a Destrin quote according to the index',
  action,
};
