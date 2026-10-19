$outputPath = if ($PSScriptRoot) { Join-Path $PSScriptRoot "Salon_Management_System_Presentation.pptx" } else { ".\Salon_Management_System_Presentation.pptx" }

try {
    Write-Host "Creating PowerPoint Presentation..."
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = -1 # msoTrue

    $pres = $ppt.Presentations.Add()

    # SLIDE 1: Cover Slide
    $slide1 = $pres.Slides.Add(1, 12) # ppLayoutBlank = 12
    $slide1.Background.Fill.Solid()
    $slide1.Background.Fill.ForeColor.RGB = 0x100C0B # Dark background #0B0C10

    # Title
    $tb1 = $slide1.Shapes.AddTextbox(1, 60, 100, 840, 90)
    $tb1.TextFrame.TextRange.Text = "Salon & Spa Management System"
    $tb1.TextFrame.TextRange.Font.Name = "Segoe UI"
    $tb1.TextFrame.TextRange.Font.Size = 40
    $tb1.TextFrame.TextRange.Font.Bold = -1
    $tb1.TextFrame.TextRange.Font.Color.RGB = 0xEF46D9 # #D946EF

    # Subtitle & Project Metadata
    $tb1Sub = $slide1.Shapes.AddTextbox(1, 60, 200, 840, 280)
    $tb1Sub.TextFrame.TextRange.Text = "Full-Stack Automated Booking, Operations & POS Analytics Platform`n`n" +
        "Technical Stack: Pure Core Java (Java SE) + JDBC | Multi-Threaded HTTP Server | MySQL | Vanilla HTML5/CSS3/JS`n`n" +
        "CSE Div - A (Batch - T2) | Semester 5 Software Project`n" +
        "Team Members: Praful Ghatage (24UCS033) | Aryan Jadhav (24UCS039) | Rajvardhan Jadhav (24UCS041) | Vedant Jagdale (24UCS045)"
    $tb1Sub.TextFrame.TextRange.Font.Name = "Segoe UI"
    $tb1Sub.TextFrame.TextRange.Font.Size = 16
    $tb1Sub.TextFrame.TextRange.Font.Color.RGB = 0xEEEEEE

    # SLIDE 2: The Challenge & Our Solution
    $slide2 = $pres.Slides.Add(2, 12)
    $slide2.Background.Fill.Solid()
    $slide2.Background.Fill.ForeColor.RGB = 0x100C0B

    $t2 = $slide2.Shapes.AddTextbox(1, 60, 40, 840, 50)
    $t2.TextFrame.TextRange.Text = "The Challenge & Our Solution"
    $t2.TextFrame.TextRange.Font.Size = 32
    $t2.TextFrame.TextRange.Font.Bold = -1
    $t2.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

    $pBox = $slide2.Shapes.AddShape(1, 60, 120, 400, 380) # msoShapeRectangle = 1
    $pBox.Fill.Solid()
    $pBox.Fill.ForeColor.RGB = 0x221B18
    $pBox.Line.ForeColor.RGB = 0x4444EF
    $pBox.Line.Weight = 2
    $pBox.TextFrame.TextRange.Text = "TRADITIONAL SALON BOTTLENECKS`n`n- Manual Phone Bookings: High rate of scheduling conflicts and double bookings.`n- No 24/7 Access: Clients unable to reserve appointments outside business hours.`n- Disorganized POS: Inefficient paper receipts and slow daily sales tracking.`n- Isolated Data: No client visit history or stylist performance analytics."
    $pBox.TextFrame.TextRange.Font.Size = 14
    $pBox.TextFrame.TextRange.Font.Color.RGB = 0xEEEEEE

    $sBox = $slide2.Shapes.AddShape(1, 490, 120, 400, 380)
    $sBox.Fill.Solid()
    $sBox.Fill.ForeColor.RGB = 0x221B18
    $sBox.Line.ForeColor.RGB = 0x81B910
    $sBox.Line.Weight = 2
    $sBox.TextFrame.TextRange.Text = "LUXE DIGITAL SOLUTION`n`n- 24/7 Booking Wizard: 5-step customer workflow with instant slot selection.`n- Ref Code Check-In: Unique reference ID (SLN-XXXX) & printable tickets.`n- Executive Kanban: Real-time status pipeline (Pending to Completed).`n- Integrated POS & Analytics: One-click print receipts & Chart.js reports."
    $sBox.TextFrame.TextRange.Font.Size = 14
    $sBox.TextFrame.TextRange.Font.Color.RGB = 0xEEEEEE

    # SLIDE 3: Customer Web Portal
    $slide3 = $pres.Slides.Add(3, 12)
    $slide3.Background.Fill.Solid()
    $slide3.Background.Fill.ForeColor.RGB = 0x100C0B

    $t3 = $slide3.Shapes.AddTextbox(1, 60, 40, 840, 50)
    $t3.TextFrame.TextRange.Text = "Customer Web Portal & Features"
    $t3.TextFrame.TextRange.Font.Size = 32
    $t3.TextFrame.TextRange.Font.Bold = -1
    $t3.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

    $c1 = $slide3.Shapes.AddShape(1, 60, 120, 400, 170)
    $c1.Fill.Solid()
    $c1.Fill.ForeColor.RGB = 0x2A201A
    $c1.Line.ForeColor.RGB = 0xEF46D9
    $c1.TextFrame.TextRange.Text = "Service Menu Catalog`n`nCategorized offerings (Haircuts, Balayage, Facials, Nails) with exact duration, price, and descriptions."
    $c1.TextFrame.TextRange.Font.Size = 13

    $c2 = $slide3.Shapes.AddShape(1, 490, 120, 400, 170)
    $c2.Fill.Solid()
    $c2.Fill.ForeColor.RGB = 0x2A201A
    $c2.Line.ForeColor.RGB = 0xEF46D9
    $c2.TextFrame.TextRange.Text = "Stylist Showcase`n`nBarber & stylist directory with specialization tags, client star ratings, and direct selection."
    $c2.TextFrame.TextRange.Font.Size = 13

    $c3 = $slide3.Shapes.AddShape(1, 60, 310, 400, 170)
    $c3.Fill.Solid()
    $c3.Fill.ForeColor.RGB = 0x2A201A
    $c3.Line.ForeColor.RGB = 0xEF46D9
    $c3.TextFrame.TextRange.Text = "5-Step Booking Wizard`n`nGuided reservation workflow with real-time time slot availability and confirmation ticket."
    $c3.TextFrame.TextRange.Font.Size = 13

    $c4 = $slide3.Shapes.AddShape(1, 490, 310, 400, 170)
    $c4.Fill.Solid()
    $c4.Fill.ForeColor.RGB = 0x2A201A
    $c4.Line.ForeColor.RGB = 0xEF46D9
    $c4.TextFrame.TextRange.Text = "Self-Service Tracker`n`nClients can search appointment status anytime using their Reference Code or Phone Number."
    $c4.TextFrame.TextRange.Font.Size = 13

    # SLIDE 4: Admin Dashboard & POS
    $slide4 = $pres.Slides.Add(4, 12)
    $slide4.Background.Fill.Solid()
    $slide4.Background.Fill.ForeColor.RGB = 0x100C0B

    $t4 = $slide4.Shapes.AddTextbox(1, 60, 40, 840, 50)
    $t4.TextFrame.TextRange.Text = "Executive Admin Dashboard & POS Operations"
    $t4.TextFrame.TextRange.Font.Size = 32
    $t4.TextFrame.TextRange.Font.Bold = -1
    $t4.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

    $a1 = $slide4.Shapes.AddShape(1, 60, 120, 400, 170)
    $a1.Fill.Solid()
    $a1.Fill.ForeColor.RGB = 0x2A201A
    $a1.Line.ForeColor.RGB = 0xF65C8B
    $a1.TextFrame.TextRange.Text = "Live KPI Metrics & Analytics`n`nReal-time tracking for Today's Bookings, Total Revenue (₹ INR), Active Stylists, and Chart.js reports."
    $a1.TextFrame.TextRange.Font.Size = 13

    $a2 = $slide4.Shapes.AddShape(1, 490, 120, 400, 170)
    $a2.Fill.Solid()
    $a2.Fill.ForeColor.RGB = 0x2A201A
    $a2.Line.ForeColor.RGB = 0xF65C8B
    $a2.TextFrame.TextRange.Text = "Kanban Pipeline Board`n`n4-stage workflow (Pending, Confirmed, In-Progress, Completed) with quick status buttons."
    $a2.TextFrame.TextRange.Font.Size = 13

    $a3 = $slide4.Shapes.AddShape(1, 60, 310, 400, 170)
    $a3.Fill.Solid()
    $a3.Fill.ForeColor.RGB = 0x2A201A
    $a3.Line.ForeColor.RGB = 0xF65C8B
    $a3.TextFrame.TextRange.Text = "Service & Staff CRUD`n`nFull management modals to create, update pricing, toggle status, or delete services and stylists."
    $a3.TextFrame.TextRange.Font.Size = 13

    $a4 = $slide4.Shapes.AddShape(1, 490, 310, 400, 170)
    $a4.Fill.Solid()
    $a4.Fill.ForeColor.RGB = 0x2A201A
    $a4.Line.ForeColor.RGB = 0xF65C8B
    $a4.TextFrame.TextRange.Text = "POS Quick Invoice Generator`n`nGenerates clean, GST-compliant printable tax invoices with UPI / Cash settlement."
    $a4.TextFrame.TextRange.Font.Size = 13

    # SLIDE 5: MySQL Database & Architecture
    $slide5 = $pres.Slides.Add(5, 12)
    $slide5.Background.Fill.Solid()
    $slide5.Background.Fill.ForeColor.RGB = 0x100C0B

    $t5 = $slide5.Shapes.AddTextbox(1, 60, 40, 840, 50)
    $t5.TextFrame.TextRange.Text = "MySQL Schema & System Architecture"
    $t5.TextFrame.TextRange.Font.Size = 32
    $t5.TextFrame.TextRange.Font.Bold = -1
    $t5.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

    $dbBox = $slide5.Shapes.AddShape(1, 60, 120, 400, 380)
    $dbBox.Fill.Solid()
    $dbBox.Fill.ForeColor.RGB = 0x201815
    $dbBox.Line.ForeColor.RGB = 0x06B6D4
    $dbBox.Line.Weight = 2
    $dbBox.TextFrame.TextRange.Text = "7 NORMALIZED MYSQL TABLES (salon_db)`n`n1. categories: Category titles & icons`n2. services: Prices (₹ INR), durations, image URLs`n3. stylists: Bios, ratings, active status`n4. customers: Contact info & visit counts`n5. appointments: Ref code (SLN-XXXX), dates, status`n6. payments: UPI/Cash/Card transaction logs`n7. reviews: Star ratings & comments"
    $dbBox.TextFrame.TextRange.Font.Size = 13

    $archBox = $slide5.Shapes.AddShape(1, 490, 120, 400, 380)
    $archBox.Fill.Solid()
    $archBox.Fill.ForeColor.RGB = 0x201815
    $archBox.Line.ForeColor.RGB = 0x06B6D4
    $archBox.Line.Weight = 2
    $archBox.TextFrame.TextRange.Text = "DUAL-MODE ARCHITECTURE (Java + Fallback)`n`n- Live Java Backend: Pure Core Java SE HttpServer + JDBC REST API at http://localhost:3000/api.`n`n- Resilient Fallback: Automatically uses LocalStorage state when MySQL is offline, making viva presentations 100% crash-free!"
    $archBox.TextFrame.TextRange.Font.Size = 13

    # SLIDE 6: Business Value & Roadmap
    $slide6 = $pres.Slides.Add(6, 12)
    $slide6.Background.Fill.Solid()
    $slide6.Background.Fill.ForeColor.RGB = 0x100C0B

    $t6 = $slide6.Shapes.AddTextbox(1, 60, 40, 840, 50)
    $t6.TextFrame.TextRange.Text = "Business Value & Future Expansion"
    $t6.TextFrame.TextRange.Font.Size = 32
    $t6.TextFrame.TextRange.Font.Bold = -1
    $t6.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

    $vBox = $slide6.Shapes.AddShape(1, 60, 120, 400, 380)
    $vBox.Fill.Solid()
    $vBox.Fill.ForeColor.RGB = 0x201815
    $vBox.Line.ForeColor.RGB = 0xEF46D9
    $vBox.Line.Weight = 2
    $vBox.TextFrame.TextRange.Text = "IMMEDIATE BUSINESS IMPACT`n`n- 35% Staff Time Saved: Automated client booking reduces front-desk phone calls.`n- Zero Double-Bookings: Real-time slot checking & stylist assignment.`n- Modern Brand Prestige: Glassmorphism UI & digital ticket experience.`n- Accurate Sales Reports: Instant POS receipts & daily revenue charts."
    $vBox.TextFrame.TextRange.Font.Size = 13

    $rBox = $slide6.Shapes.AddShape(1, 490, 120, 400, 380)
    $rBox.Fill.Solid()
    $rBox.Fill.ForeColor.RGB = 0x201815
    $rBox.Line.ForeColor.RGB = 0x8B5CF6
    $rBox.Line.Weight = 2
    $rBox.TextFrame.TextRange.Text = "FUTURE EXPANSION ROADMAP`n`n- SMS & WhatsApp Reminders: Twilio integration for automated appointment alerts.`n- Payment Gateways: Online card payments via Stripe / Razorpay.`n- Stylist Mobile App: Companion mobile app for staff schedule management.`n- Multi-Branch Support: Centralized management for salon chains."
    $rBox.TextFrame.TextRange.Font.Size = 13

    # Save presentation file
    $pres.SaveAs($outputPath)
    $pres.Close()
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "SUCCESSFULLY_GENERATED_PPTX"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
