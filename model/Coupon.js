//coupon model
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: {virtuals: true}
  }
)

// if coupon is expired
CouponSchema.virtual('isExpired').get(function(){
  return this.endDate < Date.now()
})

// 'daysLeft': Remaining valid days of coupon, 0 if expired.
const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;
CouponSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const differenceInMilliseconds = this.endDate - now;
  const differenceInDays = Math.ceil(differenceInMilliseconds / MILLISECONDS_IN_A_DAY);
  return differenceInDays > 0 ? differenceInDays : 0;
});


// validation
CouponSchema.pre('validate', function(next){
  if( this.discount < 0 || this.discount > 100){
    next(new Error('Discount cannot be less than zero or greater than 100'))
  }
  next()
})

CouponSchema.pre('validate', function(next){
  if (this.startDate < new Date().setHours(0,0,0,0) || this.endDate < new Date().setHours(0,0,0,0)){
    next(new Error('Start date or End date cannot be in the past'))
  }
  next()
})

CouponSchema.pre('validate', function(next){
  if (this.endDate <= this.startDate){
    next(new Error('End date must be after Start date'))
  }
  next()
})


const Coupon = mongoose.model("Coupon", CouponSchema);

export default Coupon;
