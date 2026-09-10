# CAB System - Test Scenarios

## Test Design Approach

**Traceability:** Functional Requirement (FR) → Acceptance Criteria (AC)
→ Test Scenario (TS) → Test Case (TC)

A Test Scenario represents a business situation. Each Test Scenario
contains multiple Test Cases, including **Positive** and **Negative**
cases.

> The SRS defines 12 Acceptance Criteria (AC01--AC12). The ACs are
> written at Use Case level, not one-to-one with FRs. Therefore, Related
> FR is traced from the SRS Use Case specifications. Where the SRS does
> not explicitly define an AC for a FR, no new AC is invented.

------------------------------------------------------------------------

## TS01 - Customer Account Registration

**Related AC:** AC01 - Đăng ký tài khoản\
**Related FR:** FR01, FR02

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC01.01           Positive          Register with     Account is
                                      valid required    created
                                      information       successfully

  TC01.02           Positive          Register with     Account is
                                      valid phone       created
                                      number and        successfully
                                      password          

  TC01.03           Negative          Register with     Registration is
                                      missing required  rejected
                                      information       

  TC01.04           Negative          Register with     Error is
                                      invalid phone     displayed
                                      number format     

  TC01.05           Negative          Register with     Duplicate account
                                      existing account  is not created
                                      information       

  TC01.06           Negative          Register with     Registration is
                                      invalid password  rejected
  -----------------------------------------------------------------------

## TS02 - Customer Login

**Related AC:** AC02 - Đăng nhập\
**Related FR:** FR03, FR04

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC02.01           Positive          Login with valid  Customer can
                                      credentials       access the system

  TC02.02           Negative          Login with        Login is rejected
                                      incorrect         
                                      password          

  TC02.03           Negative          Login with        Login is rejected
                                      invalid or        
                                      non-existing      
                                      account           

  TC02.04           Negative          Login with        Request is
                                      missing           rejected
                                      credentials       

  TC02.05           Negative          Login with an     Account status is
                                      unusable account  reported
  -----------------------------------------------------------------------

## TS03 - Create Booking

**Related AC:** AC03 - Đặt chuyến xe\
**Related FR:** FR15, FR16, FR17, FR18, FR19, FR20

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC03.01           Positive          Create booking    Booking is
                                      with valid        created
                                      pickup,           
                                      destination, and  
                                      vehicle type      

  TC03.02           Positive          Confirm a valid   Booking enters
                                      booking after     Waiting for
                                      trip information  Driver
                                      is displayed      

  TC03.03           Negative          Create booking    Booking is
                                      without pickup    rejected
                                      location          

  TC03.04           Negative          Create booking    Booking is
                                      without           rejected
                                      destination       

  TC03.05           Negative          Create booking    Booking is
                                      with invalid trip rejected
                                      information       

  TC03.06           Negative          Create booking    Booking is not
                                      without Customer  allowed
                                      authentication    
  -----------------------------------------------------------------------

## TS04 - Find and Assign Driver

**Related AC:** AC04 - Tìm tài xế\
**Related FR:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

  ------------------------------------------------------------------------
  Test Case ID      Type              Test Case          Expected Result
  ----------------- ----------------- ------------------ -----------------
  TC04.01           Positive          Find a suitable    Suitable driver
                                      Available/Online   is selected
                                      driver             

  TC04.02           Positive          Assign a driver    Driver receives
                                      matching the       the request
                                      requested trip or  
                                      vehicle type       

  TC04.03           Negative          Candidate driver   Driver is not
                                      is Offline         assigned

  TC04.04           Negative          Driver does not    Driver is not
                                      match the          selected
                                      requested type     

  TC04.05           Negative          Driver rejects the System searches
                                      request            for another
                                                         driver

  TC04.06           Negative          No suitable driver Customer is
                                      remains            notified

  TC04.07           Negative          Same rejected      System does not
                                      driver is          send the same
                                      considered again   request again
                                      for the same       
                                      request            
  ------------------------------------------------------------------------

## TS05 - Driver Accepts or Rejects Trip

**Related AC:** AC05 - Nhận/chấp nhận chuyến\
**Related FR:** FR29, FR30, FR31, FR32, FR33, FR34

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC05.01           Positive          Available driver  Driver is
                                      accepts a trip    confirmed

  TC05.02           Positive          Customer receives Customer receives
                                      the result after  driver
                                      driver accepts    information

  TC05.03           Negative          Driver rejects a  System searches
                                      trip              for another
                                                        driver

  TC05.04           Negative          Driver who cannot Acceptance is
                                      receive trips     rejected
                                      attempts to       
                                      accept            

  TC05.05           Negative          Another driver    Trip is not
                                      attempts to       assigned twice
                                      accept an already 
                                      accepted trip     
  -----------------------------------------------------------------------

## TS06 - Execute Trip

**Related AC:** AC06 - Thực hiện chuyến\
**Related FR:** FR35, FR36, FR37, FR38, FR39, FR40, FR41

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC06.01           Positive          Confirmed driver  Trip becomes In
                                      starts the trip   Progress
                                      after arriving at 
                                      pickup point      

  TC06.02           Positive          Customer monitors Current status is
                                      an ongoing trip   available

  TC06.03           Positive          Driver reaches    Trip becomes
                                      destination and   Completed
                                      ends trip         

  TC06.04           Negative          Unconfirmed       Start is rejected
                                      driver attempts   
                                      to start the trip 

  TC06.05           Negative          Driver attempts   Trip is not
                                      to complete the   incorrectly
                                      trip before the   completed
                                      required          
                                      completion        
                                      condition         
  -----------------------------------------------------------------------

## TS07 - Cancel Trip

**Related AC:** AC07 - Hủy chuyến\
**Related FR:** No explicit FR mapping is stated for AC07 in the SRS.

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC07.01           Positive          Customer requests Trip becomes
                                      cancellation when Cancelled
                                      allowed           

  TC07.02           Positive          Driver requests   Cancellation is
                                      cancellation      processed
                                      according to      
                                      applicable rules  

  TC07.03           Negative          Customer requests Request is
                                      cancellation when rejected with a
                                      not allowed       reason

  TC07.04           Negative          Cancellation is   Trip is not
                                      requested in an   cancelled
                                      invalid trip      
                                      state             

  TC07.05           Negative          Cancellation      Fee is handled
                                      involves a fee    according to the
                                      under the         policy
                                      confirmed policy  
  -----------------------------------------------------------------------

> The SRS states that the cancellation policy is still an open question.
> Do not add exact cancellation timing or fee values.

## TS08 - Trip Payment

**Related AC:** AC08 - Thanh toán\
**Related FR:** FR45, FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53,
FR54

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC08.01           Positive          Pay for a         Cash payment is
                                      completed trip    recorded
                                      using cash        

  TC08.02           Positive          Pay for a         Request is sent
                                      completed trip    to Payment
                                      electronically    Provider

  TC08.03           Positive          Electronic        Payment becomes
                                      payment succeeds  Paid and
                                                        transaction is
                                                        recorded

  TC08.04           Negative          Pay for a trip    Payment is
                                      that is not       rejected
                                      completed         

  TC08.05           Negative          Select an invalid Payment request
                                      payment method    is rejected

  TC08.06           Negative          Electronic        Customer is
                                      payment fails     notified

  TC08.07           Negative          Payment Provider  Appropriate
                                      does not respond  payment state is
                                                        recorded and
                                                        booking service
                                                        continues

  TC08.08           Negative          Retry a failed    Retry follows the
                                      electronic        confirmed
                                      payment           business policy
  -----------------------------------------------------------------------

## TS09 - Driver Review

**Related AC:** AC09 - Đánh giá chuyến xe\
**Related FR:** FR65, FR66

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC09.01           Positive          Submit a valid    Review is saved
                                      review for a      
                                      completed trip    

  TC09.02           Positive          Submit a valid    Review is saved
                                      rating with a     and driver rating
                                      supported comment is updated

  TC09.03           Negative          Review a trip     Review is
                                      that is not       rejected
                                      completed         

  TC09.04           Negative          Submit a rating   Review is
                                      outside the       rejected
                                      allowed range     

  TC09.05           Negative          Submit another    Review is
                                      review after the  rejected
                                      allowed count is  
                                      reached           

  TC09.06           Negative          Submit invalid    System requests
                                      review data       correction
  -----------------------------------------------------------------------

> The SRS gives 1--5 stars as an example. Treat the exact rating range
> as confirmed business data before using it as a strict test value.

## TS10 - Complaint Submission and Processing

**Related AC:** AC10 - Khiếu nại\
**Related FR:** No explicit FR mapping is stated for AC10 in the SRS.

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC10.01           Positive          Customer submits  Unique complaint
                                      a complaint with  ID is created
                                      required          
                                      information       

  TC10.02           Positive          Driver submits a  Complaint is
                                      complaint with    created with
                                      required          Pending status
                                      information       

  TC10.03           Positive          Admin processes a Complaint moves
                                      complaint and     toward
                                      updates the       Resolved/Closed
                                      result            

  TC10.04           Negative          Submit a          Complaint is
                                      complaint without rejected
                                      required          
                                      information       

  TC10.05           Negative          Unauthorized user Operation is
                                      attempts to       rejected
                                      process a         
                                      complaint         

  TC10.06           Negative          Complaint         Complaint is not
                                      processing fails  incorrectly
                                                        marked as
                                                        resolved
  -----------------------------------------------------------------------

## TS11 - Driver Approval

**Related AC:** AC11 - Duyệt tài xế\
**Related FR:** FR07, FR08, FR09, FR10, FR12

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC11.01           Positive          Driver provides   Admin can review
                                      required          the profile
                                      information and   
                                      documents         

  TC11.02           Positive          Admin approves a  Driver is
                                      valid driver      activated
                                      profile           

  TC11.03           Negative          Driver provides   Approval is not
                                      incomplete        completed
                                      required          
                                      information       

  TC11.04           Negative          Admin rejects an  Driver is
                                      invalid driver    rejected or asked
                                      profile           for additional
                                                        information

  TC11.05           Negative          Unapproved driver Driver cannot
                                      attempts to       receive a trip
                                      receive a trip    
  -----------------------------------------------------------------------

## TS12 - Driver Status Management

**Related AC:** AC12 - Quản lý trạng thái tài xế\
**Related FR:** FR13, FR14

  -----------------------------------------------------------------------
  Test Case ID      Type              Test Case         Expected Result
  ----------------- ----------------- ----------------- -----------------
  TC12.01           Positive          Driver changes    Status is updated
                                      from Online to    
                                      Offline           

  TC12.02           Positive          Driver becomes    Driver can become
                                      Available after   available
                                      completing a trip 

  TC12.03           Positive          Available driver  Driver can
                                      receives a trip   receive a trip
                                      assignment        

  TC12.04           Negative          Offline driver    Driver is not
                                      attempts to       assigned
                                      receive a trip    

  TC12.05           Negative          Driver performing Driver is not
                                      a trip attempts   assigned another
                                      to receive        trip
                                      another trip      

  TC12.06           Negative          Driver attempts   Transition is
                                      an invalid status rejected
                                      transition        
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Coverage Summary

  AC     Scenario     Positive   Negative
  ------ ---------- ---------- ----------
  AC01   TS01                2          4
  AC02   TS02                1          4
  AC03   TS03                2          4
  AC04   TS04                2          5
  AC05   TS05                2          3
  AC06   TS06                3          2
  AC07   TS07                2          3
  AC08   TS08                3          5
  AC09   TS09                2          4
  AC10   TS10                3          3
  AC11   TS11                2          3
  AC12   TS12                3          3

## Traceability Rule

Use:

**BR → FR → UC/AC → TS → TC**

Do not force one AC onto every FR. The SRS has 98 FRs but only 12
explicitly defined ACs. For FRs without an explicit AC, keep the AC
field as **Not explicitly defined in SRS** until the requirement is
clarified.
