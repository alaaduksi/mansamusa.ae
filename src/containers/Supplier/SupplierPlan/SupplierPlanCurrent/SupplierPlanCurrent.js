import React, { useContext, useEffect, useState } from 'react'
import { firestore } from '../../../../firebase/config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AppContext from '../../../../components/AppContext'
import moment from 'moment'
import 'moment/locale/ar'
import 'moment/locale/en-gb'
import SignUpButton from '../../../../components/UI/SignUpButton/SignUpButton'

import styles from './SupplierPlanCurrent.module.scss'


const SupplierPlanCurrent = ({ current, isError, setCurrent, currentUser, currentStore }) => {

  const context = useContext(AppContext)
  let { lang } = context
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(false)

  moment.locale(lang)

  useEffect(() => {

    if (current === null) return

    firestore
      .collection('mmProducts')
      .doc(current.subscriptionId)
      .get()
      .then(doc => {
        setSub(doc.data())
      })

  }, [current])

  const handleCancel = async (subscriptionId) => {

    setLoading(true)

    firestore.collection('users')
      .doc(currentUser.uid)
      .collection('stores').doc(currentStore.id).update({
      isSubscribed : false,
      isTrial: true,
      trialExpiresIn: 3
    })

    await fetch('https://subscriptions.mansamusa.ae/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId
      }),
    })
      .then(r => r.json())

    await firestore
      .collection('subscriptions')
      .doc(current.id)
      .delete()

    setLoading(false)

    setTimeout(() => {
      setCurrent(null)
    }, 300)

  }


  return(

    <>

      <div className='row mb-4'>

        {
          sub !== null ?
            <div className='col-12'>

              <div className={styles.SupplierPlanCurrent}>

                <div className={styles.name}>

                  <div className={styles.planName}>
                    { sub.name }
                  </div>

                  <div className={styles.price}>
                    { sub.unit_amount } { sub.currency } / { sub.interval.toLowerCase() }
                  </div>

                </div>

                <div className={styles.status}>
                  <FontAwesomeIcon icon={'check'} fixedWidth />
                  Active
                </div>

              </div>

            </div> : <></>
        }

      </div>

      <div className='row mt-5'>
        <div className='col-lg-3 col-'/>
        <div className='col-lg-6 col-12'>
          <SignUpButton
            type={'custom'}
            loading={loading}
            title={isError ? 'Something Went Wrong' : 'Cancel Subscription'}
            onClick={() => handleCancel(current.stripe.subscriptionId)}
            disabled={false}
          />
        </div>
        <div className='col-lg-3 col-'/>
      </div>

      <div className='row mt-3'>
        <div className='col-lg-3 col-'/>
        <div className='col-lg-6 col-12'>
          {
            isError ?
              <div className={styles.description}>
                Please try again later or contact our support center for more details.
              </div> :
              <div className={styles.description}>
                It is possible to cancel and start a new subscription at any time.
                Subscription payment is not refundable.
                We turn back 3 days trial back after subscription cancellation.
              </div>
          }
        </div>
        <div className='col-lg-3 col-'/>
      </div>

    </>

   )

}

export default SupplierPlanCurrent