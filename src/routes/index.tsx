import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
const ddr5 = "/images/ddr5-gaming-pc.jpg";
const gtx1080 = "/images/gtx1080-gaming-pc.jpg";
const gtx1070 = "/images/gtx1070-gaming-pc.jpg";
const p1080 = "/images/1080p-gaming-pc.jpg";
import { BUSINESS, buildLocalBusinessJsonLd } from "@/lib/business";
import { REVIEWS } from "@/lib/reviews";

const TITLE = "Amelia Tech & Auto LLC | Computer & Automotive Sales & Service";
const DESCRIPTION =
  "Amelia Tech & Auto LLC in Elyria, Ohio. Computer sales and repair, custom gaming desktops, and mobile automotive service by appointment.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Amelia Tech & Auto LLC | Elyria, Ohio" },
      {
        property: "og:description",
        content: "Custom gaming PCs, computer repair, and mobile auto service. Talk directly to the technician.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(buildLocalBusinessJsonLd()) }],
  }),
  component: Index,
});

function Reviews() {
  const [index, setIndex] = useState(0);
  const [per, setPer] = useState(2);
  useEffect(() => {
    const mq = matchMedia("(max-width:790px)");
    const update = () => setPer(mq.matches ? 1 : 2);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const n = REVIEWS.length;
  const shown = Array.from({ length: per }, (_, offset) => REVIEWS[(index + offset) % n]).filter(
    (r): r is (typeof REVIEWS)[number] => r !== undefined,
  );
  return (
    <>
      <div id="review-cards" className="reviews-grid">
        {shown.map((r) => (
          <article className="card review" key={r.name + r.date}>
            <div>
              <div className="review-top">
                <span className="stars" aria-label="5 out of 5 stars">★★★★★</span>
                <time>{r.date}</time>
              </div>
              <blockquote>“{r.text}”</blockquote>
            </div>
            <div className="review-bottom">
              <div>
                <strong>{r.name}</strong>
                <small>{r.source}</small>
              </div>
              <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a>
            </div>
          </article>
        ))}
      </div>
      <div className="review-controls">
        <button type="button" id="previous" aria-label="Previous customer review" onClick={() => setIndex((i) => (i - 1 + n) % n)}>‹</button>
        <span className="review-count" id="review-count" aria-live="polite">
          {per === 1 ? `Review ${index + 1} of ${n}` : `Reviews ${index + 1}–${((index + 1) % n) + 1} of ${n}`}
        </span>
        <button type="button" id="next" aria-label="Next customer review" onClick={() => setIndex((i) => (i + 1) % n)}>›</button>
      </div>
    </>
  );
}

type SubmitState = "idle" | "sending" | "sent" | "error";

function Index() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  // "Ask about…" buttons anywhere on the page (header pills included) jump to the quote form.
  useEffect(() => {
    const startInquiry = (dept: string, build?: string) => {
      const select = document.getElementById("department") as HTMLSelectElement | null;
      const message = document.getElementById("message") as HTMLTextAreaElement | null;
      if (select) select.value = dept;
      if (build && message) message.value = `I'm interested in a build similar to your ${build}. My budget and the games I play are: `;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      document.getElementById("full-name")?.focus({ preventScroll: true });
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-dept],[data-build]");
      if (!el) return;
      if (el.dataset["build"]) startInquiry("Computer Sales", el.dataset["build"]);
      else if (el.dataset["dept"]) startInquiry(el.dataset["dept"]);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (submitState === "sent" || submitState === "error")
      panelRef.current?.scrollIntoView({ block: "nearest" });
  }, [submitState]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setSubmitState("sending");
    const { error } = await supabase.from("quote_requests").insert({
      name: String(f.get("name") ?? "").trim().slice(0, 100),
      email: String(f.get("email") ?? "").trim().slice(0, 160),
      phone: String(f.get("phone") ?? "").trim().slice(0, 40) || null,
      department: String(f.get("department") ?? ""),
      details: String(f.get("details") ?? "").trim().slice(0, 200) || null,
      message: String(f.get("message") ?? "").trim().slice(0, 2000),
    });
    if (error) {
      setSubmitState("error");
      return;
    }
    form.reset();
    setSubmitState("sent");
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <SiteHeader home />
      <main id="main"><section className="hero" id="hero"><div className="wrap"><div className="hero-grid"><div className="main-promo"><span className="hero-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>Elyria, Ohio • Direct-to-Technician</span><h1>Computer & Automotive<br />Sales & Service.</h1><p>Custom gaming desktops, computer hardware repairs, and mobile automotive maintenance. Speak directly with the technician doing the work.</p><div className="actions"><a href="#recent-work" className="btn primary">Explore Gaming PCs <span aria-hidden="true">→</span></a><button type="button" className="btn secondary" data-dept="Automotive Repair">Mobile Auto Service</button></div><div className="hero-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>One local contact for your computer and automotive needs.</div></div><div className="side-promos"><article className="side-tile"><div><div className="tile-label"><span>Hardware Department</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5"/><path d="M10 10h4v4h-4z"/></svg></div><h2>Gaming Desktops<br />Built Around Your Budget</h2><p>Past builds sold for $350–$550. Ask about current inventory and custom-build options.</p></div><button type="button" className="btn primary" data-dept="Computer Sales">Check Current Options <span aria-hidden="true">→</span></button></article><article className="side-tile auto"><div><div className="tile-label"><span>Automotive Care</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6a5 5 0 0 0-6 6L2 18a3 3 0 0 0 4 4l7-7a5 5 0 0 0 6-6l-4 3-3-3 3-4z"/></svg></div><h2>Mobile Automotive Repair</h2><p>Brakes, starters, alternators, battery testing, and vehicle diagnostics. Ask about service at your location.</p></div><button type="button" className="btn secondary" data-dept="Automotive Repair">Ask About Mobile Service <span aria-hidden="true">→</span></button></article></div></div></div></section>
      <section className="block" id="departments"><div className="wrap"><div className="intro"><span className="eyebrow">Two Specialized Divisions</span><h2>Core Service Departments</h2><p>Computer hardware and automotive care, with direct communication from start to finish.</p></div><div className="dept-grid"><article className="card"><div className="dept-head"><div className="dept-icon-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5"/><path d="M10 10h4v4h-4z"/></svg><span>Technology Division</span></div><h3>Computer Sales & Repair</h3><p>Gaming rigs, hardware diagnostics, cooling, and component upgrades.</p></div><div className="dept-body"><ul className="checklist"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Custom gaming PC builds tailored to your budget</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Hardware troubleshooting, RAM &amp; GPU upgrades</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Deep cleaning, thermal paste &amp; airflow improvements</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>SSD migrations, Windows installation &amp; drivers</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Bench stress-testing &amp; thermal checks</li></ul><div className="actions"><button type="button" className="btn primary" data-dept="Computer Sales">Ask About a Gaming PC</button><button type="button" className="btn soft" data-dept="Computer Repair">Request PC Repair</button></div></div></article><article className="card"><div className="dept-head auto"><div className="dept-icon-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 6a5 5 0 0 0-6 6L2 18a3 3 0 0 0 4 4l7-7a5 5 0 0 0 6-6l-4 3-3-3 3-4z"/></svg><span>Automotive Division</span></div><h3>Automotive Repair & Sales</h3><p>Mobile diagnostics, brake service, starters, alternators, and vehicle inquiries.</p></div><div className="dept-body"><ul className="checklist"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Brake service: pads, rotors &amp; related repairs</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Starter, alternator &amp; battery replacement</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Selected suspension repairs &amp; component replacement</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>OBD-II scanning &amp; diagnostic inquiries</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>Mobile service by appointment at suitable locations</li></ul><div className="actions"><button type="button" className="btn secondary" data-dept="Automotive Repair">Request Auto Service</button><button type="button" className="btn soft" data-dept="Vehicle Sales">Inquire on Vehicles</button></div></div></article></div><p className="small-note">Mobile availability and repair suitability depend on the vehicle, location, and appointment schedule. Contact us before visiting or arranging service.</p></div></section>
      <section className="block white" id="recent-work"><div className="wrap"><div className="section-header"><div><span className="eyebrow">Previous Computer Builds</span><h2>Recent Completed Work</h2><p>Real builds with photos from our Marketplace listings. Ask what is available now.</p></div><span className="price-chip">Past sales: $350–$550</span></div><div className="build-grid"><article className="build card"><img src={ddr5.url} alt="DDR5 Gaming PC sold by Amelia Tech &amp; Auto" loading="lazy" /><div className="build-tag blue">DDR5 platform</div><h3>DDR5 Gaming PC</h3><p>Intel Core i3-14100F, AMD Radeon RX 5600 XT 6GB, 8GB DDR5-4800, 1TB+ storage, Windows 11.</p><div className="sold"><span>Marketplace price</span><strong>$550</strong></div><button type="button" className="btn bordered" data-build="DDR5 Gaming PC">Request Similar Build <span aria-hidden="true">→</span></button></article><article className="build card"><img src={gtx1080.url} alt="GTX 1080 Gaming PC sold by Amelia Tech &amp; Auto" loading="lazy" /><div className="build-tag green">GTX 1080</div><h3>GTX 1080 Gaming PC</h3><p>EVGA GeForce GTX 1080 graphics in a mesh-front case with RGB fans.</p><div className="sold"><span>Previously sold</span><strong>$500</strong></div><button type="button" className="btn bordered" data-build="GTX 1080 Gaming PC">Request Similar Build <span aria-hidden="true">→</span></button></article><article className="build card"><img src={gtx1070.url} alt="GTX 1070 Gaming PC sold by Amelia Tech &amp; Auto" loading="lazy" /><div className="build-tag purple">GTX 1070</div><h3>GTX 1070 Gaming PC</h3><p>EVGA GeForce GTX 1070 graphics with RGB case fans and a tempered-glass side.</p><div className="sold"><span>Previously sold</span><strong>$400</strong></div><button type="button" className="btn bordered" data-build="GTX 1070 Gaming PC">Request Similar Build <span aria-hidden="true">→</span></button></article><article className="build card"><img src={p1080.url} alt="1080p Gaming PC sold by Amelia Tech &amp; Auto" loading="lazy" /><div className="build-tag amber">1080p budget</div><h3>1080p Gaming PC</h3><p>Intel Core i5-6600K, AMD Radeon RX 5600 XT 6GB, 16GB RAM, 238GB SSD.</p><div className="sold"><span>Previously sold</span><strong>$350</strong></div><button type="button" className="btn bordered" data-build="1080p Gaming PC">Request Similar Build <span aria-hidden="true">→</span></button></article></div><p className="small-note">Ask for current availability, full specifications, and a quote for a similar build.</p></div></section>
      <section className="block" id="reviews"><div className="wrap"><div className="intro"><span className="eyebrow">Customer Feedback</span><h2>Buyer Reviews</h2><p>Verbatim feedback from buyers on Facebook Marketplace.</p></div><Reviews /></div></section>
      <section className="block white" id="about"><div className="wrap about-grid"><div className="about-copy"><span className="eyebrow">Direct-to-Technician Service</span><h2>No Service Advisors.<br />No Middlemen.<br />Just Your Technician.</h2><p>At Amelia Tech & Auto LLC, you speak directly with the person working on your computer or vehicle. Explain the issue, ask questions, and discuss the options without passing through a service desk.</p><p>Based in Elyria, Ohio, we bring computer hardware and automotive service together under one local business. Whether you’re planning a gaming PC or asking about a repair, start with a conversation.</p><p>Owned and operated by Jaevon Bell, who has 11 years of experience with computers and 6 years fixing cars in a family auto shop.</p></div><div className="about-box"><h3>The Amelia Tech & Auto Approach</h3><div className="about-point"><span>1</span><div><strong>Discuss your needs</strong><p>Share your goals, symptoms, and budget so we can talk through the right next step.</p></div></div><div className="about-point"><span>2</span><div><strong>Understand your options</strong><p>Ask about specifications, parts, pricing, and the proposed work before moving forward.</p></div></div><div className="about-point"><span>3</span><div><strong>Arrange service directly</strong><p>Confirm appointment availability and whether mobile automotive service is suitable for your location.</p></div></div></div></div></section>
      <section className="block" id="bizinfo" style={{ paddingTop: 0 }}><div className="wrap"><div className="card bizinfo"><h3>Business Information</h3><dl><div><dt>Legal name</dt><dd>Amelia Tech &amp; Auto LLC</dd></div><div><dt>Business type</dt><dd>Limited liability company</dd></div><div><dt>Owner</dt><dd>Jaevon Bell</dd></div><div><dt>Serving Elyria since</dt><dd>2025</dd></div><div><dt>Address</dt><dd>220 5th St, Elyria, OH 44035 · <a href="https://www.google.com/maps/search/?api=1&amp;query=220+5th+St+Elyria+OH+44035" target="_blank" rel="noopener noreferrer">Directions ↗</a></dd></div><div><dt>Phone</dt><dd><a href="tel:+14404531371">(440) 453-1371</a></dd></div><div><dt>Email</dt><dd><a href="mailto:jaevonbell@ameliatechauto.com">jaevonbell@ameliatechauto.com</a></dd></div><div><dt>Hours</dt><dd>Mon–Sat 9:00 AM–6:00 PM · call or text to confirm</dd></div><div><dt>Services</dt><dd>Computer sales &amp; repair · automotive repair · vehicle sales</dd></div><div><dt>Service area</dt><dd>Elyria &amp; nearby Lorain County, Ohio · <a href="#service-area">See map</a></dd></div><div><dt>Payment methods</dt><dd>Cash App · Zelle · Apple Pay · Google Pay · cash</dd></div></dl></div></div></section>
      <section className="block white" id="service-area"><div className="wrap"><div className="intro"><span className="eyebrow">Where We Work</span><h2>Areas We Serve</h2><p>Based at 220 5th St in Elyria, serving customers across nearby Lorain County communities.</p></div><div className="area-grid"><div className="card area-card"><h3>Elyria &amp; Lorain County</h3><p>Computer sales and repair, plus appointment-based mobile automotive service, for customers in and around Elyria, Ohio.</p><ul className="area-list">{BUSINESS.serviceArea.map((city) => (<li key={city}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>{city}</li>))}</ul><p className="small-note">Don’t see your town? Call or text to ask. Mobile service depends on the vehicle, location, and schedule.</p><div className="actions"><a className="btn primary" href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer">Get Directions <span aria-hidden="true">↗</span></a><a className="btn soft" href="tel:+14404531371">Call (440) 453-1371</a></div></div><div className="card map-card"><iframe title="Map showing Amelia Tech &amp; Auto at 220 5th St, Elyria, OH 44035" src={BUSINESS.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></div></div></section>
      <section className="block" id="faq"><div className="wrap"><div className="intro"><span className="eyebrow">Common Questions</span><h2>Frequently Asked Questions</h2></div><div className="faq"><details><summary>Do I need an appointment?</summary><p>Yes, please call or text first. Mobile automotive service is by appointment, and we confirm availability and whether your vehicle and location are suitable.</p></details><details><summary>What payment methods do you accept?</summary><p>We accept Cash App, Zelle, Apple Pay, Google Pay, and cash. Payment terms are confirmed on your estimate or invoice before work begins.</p></details><details><summary>How do estimates work?</summary><p>You get a price before work starts. For vehicle repairs you can choose a written, oral, or no estimate, and we won’t go past the agreed amount without your approval.</p></details><details><summary>What if I don’t know what’s wrong?</summary><p>Describe the symptoms in the quote form or call us. We diagnose first, explain your options, and you decide what to fix.</p></details><details><summary>Can I see the specs before buying a PC?</summary><p>Yes. Every build lists its CPU, graphics card, RAM, and storage, and you can ask for photos or a demo of the exact machine.</p></details><details><summary>Do you sell used vehicles?</summary><p>Ask about current availability by call or text. Vehicle terms, including any warranty, are given in writing at the time of sale.</p></details><details><summary>What about warranty and returns?</summary><p>Any warranty or return terms are given in writing on your invoice or receipt. See our <a href="/terms">Terms &amp; Service Policy</a>.</p></details></div></div></section>
      <section className="block white" id="contact"><div className="wrap"><div className="intro"><span className="eyebrow">Get In Touch</span><h2>Request a Quote or Service</h2><p>Call, text, or send the form below to discuss your project with the technician.</p></div><div className="contact-grid"><div className="card contact-card"><h3>Direct Contact Information</h3><p>Computer sales, repair inquiries, and appointment-based mobile automotive service in Elyria and the surrounding area.</p><div className="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg><div><strong>Location</strong><p>220 5th St, Elyria, OH 44035<br />Please call or text before visiting.</p></div></div><div className="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 3 4 4-2 3a15 15 0 0 0 7 7l3-2 4 4c-1 4-5 4-8 2A25 25 0 0 1 3 11C1 8 1 4 5 3Z"/></svg><div><strong>Phone / Mobile Service</strong><a href="tel:+14404531371">(440) 453-1371</a><p><a href="sms:+14404531371">Send a text message →</a></p></div></div><div className="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/></svg><div><strong>Direct Email</strong><a href="mailto:jaevonbell@ameliatechauto.com">jaevonbell@ameliatechauto.com</a></div></div><div className="contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><div><strong>Working Hours</strong><p>Mon–Sat 9:00 AM–6:00 PM<br />Call or text to confirm · mobile service by appointment</p></div></div><a className="btn primary" href="https://www.facebook.com/AmeliaTechAuto" target="_blank" rel="noopener noreferrer">Visit Our Facebook Page <span aria-hidden="true">↗</span></a></div><div className="card form-card"><p className="form-note">Complete the details below and your request goes straight to us. We reply by phone, text, or email. See our <a href="/privacy">Privacy Policy</a>.</p><form id="quote-form" onSubmit={onSubmit}><div className="form-grid"><div className="field"><label htmlFor="full-name">Full Name *</label><input id="full-name" name="name" autoComplete="name" placeholder="Your name" maxLength={100} required /></div><div className="field"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" name="phone" autoComplete="tel" placeholder="(440) 555-0199" maxLength={40} /></div></div><div className="form-grid"><div className="field"><label htmlFor="email">Email Address *</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={160} required /></div><div className="field"><label htmlFor="department">Department / Interest *</label><select id="department" name="department" required><option value="Computer Sales">Computer Sales (Gaming Desktops)</option><option value="Computer Repair">Computer Repair & Diagnostics</option><option value="Vehicle Sales">Vehicle Sales</option><option value="Automotive Repair">Automotive Repair (Mobile Service)</option></select></div></div><div className="field"><label htmlFor="details">Budget or Vehicle/PC Model (Optional)</label><input id="details" name="details" placeholder="e.g. $450 budget, or vehicle year, make, and model" maxLength={200} /></div><div className="field"><label htmlFor="message">How Can We Help You? *</label><textarea id="message" name="message" rows={4} placeholder="Describe what you need built, repaired, or inspected…" maxLength={2000} required /></div><button type="submit" className="btn primary" disabled={submitState === "sending"}>{submitState === "sending" ? "Sending…" : "Send Request"} <span aria-hidden="true">→</span></button></form><div id="draft-panel" ref={panelRef} className="draft-panel" hidden={submitState !== "sent" && submitState !== "error"}><p role="status">{submitState === "sent" ? "Request sent. Thank you — we’ll get back to you by phone, text, or email. For anything urgent, call or text (440) 453-1371." : "Something went wrong and your request was not sent. Please try again, or call or text (440) 453-1371."}</p></div><p className="small-note">An inquiry does not confirm a booking. Please do not include passwords, payment information, or other sensitive details.</p></div></div></div></section></main>
      <SiteFooter />
    </>
  );
}
