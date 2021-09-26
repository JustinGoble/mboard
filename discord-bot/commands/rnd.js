const Joi = require('joi');

const argsSchema = Joi.array().ordered(
  Joi.number().min(1).required(),
);

function action(message, command, args) {
  if (command !== 'rnd') return false;

  const validationResult = argsSchema.validate(args);
  if (validationResult.error) throw new Error(validationResult.error);
  const [range] = validationResult.value;

  message.channel.send(Math.floor(Math.random() * range + 1));
  return true;
}

module.exports = {
  name: 'rnd <number>',
  description: 'Post random number between 1 and X',
  action,
};
