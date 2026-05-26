const { v4: uuidv4 } = require('uuid');

const idGenerator = {
  userId:    () => `USR-${uuidv4()}`,
  foodId:    () => `FOD-${uuidv4()}`,
  categoryId:() => `CAT-${uuidv4()}`,
  orderId:   () => `ORD-${uuidv4()}`,
  paymentId: () => `PMT-${uuidv4()}`,
};

module.exports = idGenerator;
