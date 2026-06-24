'use client';

import React from 'react';

export function DatasourcesTribute() {
  return (
    <div id="datasources" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Datasources &amp; In Loving Memory</h2>
        <div className="text-sm text-[var(--pw-text-muted)]">
          Every letter is God-breathed.
        </div>
      </div>

      <div className="space-y-8">
        {/* Datasources */}
        <div className="panel p-6">
          <h3 className="text-lg font-semibold mb-3 text-[var(--pw-accent-gold)]">Datasources Used</h3>
          <div className="space-y-4 text-sm text-[var(--pw-text-soft)]">
            <div>
              <div className="font-medium text-[var(--pw-text)]">Hebrew Text + Strong’s Numbers</div>
              <div>
                Open Scriptures Hebrew Bible (OSHB / morphhb) —{' '}
                <a href="https://github.com/openscriptures/morphhb" target="_blank" className="text-[var(--pw-link)] hover:underline">
                  github.com/openscriptures/morphhb
                </a>
              </div>
              <div className="text-[10px] text-[var(--pw-text-faint)]">
                The standard open-licensed Hebrew Bible based on the Westminster Leningrad Codex, with Strong’s numbers embedded.
              </div>
            </div>

            <div>
              <div className="font-medium text-[var(--pw-text)]">King James Version</div>
              <div>
                Public domain text sourced from open Bible repositories (e.g. bibleapi-bibles-json and similar public-domain collections).
              </div>
            </div>

            <div>
              <div className="font-medium text-[var(--pw-text)]">Strong’s Dictionary</div>
              <div>
                openscriptures/strongs —{' '}
                <a href="https://github.com/openscriptures/strongs" target="_blank" className="text-[var(--pw-link)] hover:underline">
                  github.com/openscriptures/strongs
                </a>
              </div>
              <div className="text-[10px] text-[var(--pw-text-faint)]">
                The classic Strong’s Hebrew and Greek definitions in open form.
              </div>
            </div>

            <div>
              <div className="font-medium text-[var(--pw-text)]">Blue Letter Bible</div>
              <div>
                Interactive Strong’s numbers, interlinear, commentaries, and lexicons:{' '}
                <a href="https://www.blueletterbible.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">
                  blueletterbible.org
                </a>
              </div>
              <div className="text-[10px] text-[var(--pw-text-faint)]">
                Primary site used throughout the app for viewing Strong’s references in full context.
              </div>
            </div>

            <div>
              <div className="font-medium text-[var(--pw-text)]">Pictographic Meanings</div>
              <div>
                Traditional Paleo-Hebrew studies (in the tradition of teachers such as Frank Seekins and others who have explored the ancient letter pictures). These are interpretive tools meant to enrich study, not replace the plain text.
              </div>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-[var(--pw-text-faint)] border-t border-[var(--pw-border)] pt-3">
            All data is drawn from openly licensed or public-domain sources. This app is a study tool, not an authoritative translation.
          </div>
        </div>

        {/* In Loving Memory of Chuck Missler */}
        <div id="dedication" className="panel p-6 border-l-4 border-[var(--pw-accent-gold)] scroll-mt-14">
          <h3 className="text-lg font-semibold mb-2 text-[var(--pw-accent-gold)]">
            In Loving Memory of Chuck Missler
          </h3>

          <div className="text-sm text-[var(--pw-text-soft)] space-y-4">
            <p>
              Chuck Missler (1934–2018) had a lifelong, passionate love for the Word of God. He taught that the Bible is not merely a book about God — it is God’s book, and that <span className="font-medium">every letter is God-breathed</span>.
            </p>

            <p>
              He loved to marvel at the “hidden” structures placed by the Author — patterns in the text, numbers, pictures, and even the very letters themselves. For Chuck, the Bible was inexhaustible. He often reminded listeners that the same text could be read at many levels, all of them true, all of them placed there intentionally.
            </p>

            <div>
              <div className="font-medium text-[var(--pw-text)] mb-2">Different Views on the Letters (in Chuck Missler fashion)</div>

              <div className="space-y-3">
                <div>
                  <div className="font-medium">The Plain / Literal View</div>
                  <div className="text-[var(--pw-text-faint)] text-xs">
                    The text means what it says in its historical and grammatical context. The pictographs are fascinating historical background, but the primary meaning is the plain reading.
                  </div>
                </div>

                <div>
                  <div className="font-medium">The Pictographic / Symbolic View</div>
                  <div className="text-[var(--pw-text-faint)] text-xs">
                    The ancient letters were originally pictures. When you read a word, you are also “reading” a picture that often reinforces or adds depth to the plain meaning. This is the heart of paleoMem.
                  </div>
                </div>

                <div>
                  <div className="font-medium">The Numerological / Gematria View</div>
                  <div className="text-[var(--pw-text-faint)] text-xs">
                    Each letter carries a numeric value. The sums, multiples, and structures that appear throughout Scripture are not accidents (Chuck was especially fond of this layer — 666, 153, 40, 7, etc.).
                  </div>
                </div>

                <div>
                  <div className="font-medium">The Typological / Christological View</div>
                  <div className="text-[var(--pw-text-faint)] text-xs">
                    The letters, words, and stories are woven with types and shadows that ultimately point to the person and work of Jesus Christ.
                  </div>
                </div>

                <div>
                  <div className="font-medium">The Multi-Layer View (PaRDeS / “layer upon layer”)</div>
                  <div className="text-[var(--pw-text-faint)] text-xs">
                    Chuck often referenced the Jewish four-fold approach (Peshat – plain, Remez – hint, Derash – search/allegory, Sod – secret/hidden). He taught that the Bible frequently operates on multiple valid levels at the same time.
                  </div>
                </div>
              </div>
            </div>

            {/* Support section - arguments in favor */}
            <div className="pt-3 border-t border-[var(--pw-border)]">
              <div className="font-medium text-[var(--pw-text)] mb-2">Arguments in Support of Pictographic Interpretation</div>

              <div className="space-y-2 text-xs text-[var(--pw-text-faint)]">
                <div>
                  <span className="font-medium text-[var(--pw-text)]">Historical Foundation:</span> The letters of the earliest Hebrew script (Proto-Sinaitic/Paleo-Hebrew) did in fact begin as pictures. Aleph was an ox head, Bet a tent/house, Gimel a camel’s foot or lifted foot, etc. This is not speculation but a well-documented development from Egyptian hieroglyphic influences around 1800–1500 BC.<sup><a href="https://en.wikipedia.org/wiki/Proto-Sinaitic_script" target="_blank" className="text-[var(--pw-link)] hover:underline">[1]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Striking Consistency:</span> In many cases, the proposed pictographic meaning of the letters aligns remarkably well with the established root meaning of the Hebrew word. For example, the word for “covenant” (berit) contains letters whose pictures can be read as “house of the head” or “family of the leader,” evoking ideas of household and authority.<sup><a href="https://www.ancient-hebrew.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[2]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Biblical Precedent for Symbolism:</span> Scripture itself frequently employs visual signs, types, and symbolic language. God uses the rainbow, the tabernacle furniture, prophetic object lessons, and even the shape of the cross. If God communicates through pictures elsewhere, it is not unreasonable to explore whether the letters themselves carry intentional visual meaning.<sup><a href="https://www.khouse.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[3]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">“Every Letter Is God-Breathed”:</span> If God inspired not only the words but the very letters (as 2 Timothy 3:16 and the care with which the text was preserved suggest), it is reasonable to ask whether the form of those letters also carries meaning placed there by the Author.<sup><a href="https://www.biblegateway.com/passage/?search=2+Timothy+3%3A16&version=KJV" target="_blank" className="text-[var(--pw-link)] hover:underline">[4]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Edifying Fruit:</span> For thousands of believers, including teachers like Chuck Missler, this approach has produced greater awe, deeper meditation, and fresh appreciation for the unity and craftsmanship of Scripture without undermining the plain, literal meaning of the text.<sup><a href="https://www.khouse.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[3]</a></sup>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-[var(--pw-text-faint)]">
                Proponents often emphasize that pictographic insights are meant to be held with humility and always tested against the clear, contextual meaning of the passage. See also Frank Seekins, <em>Hebrew Word Pictures</em> and Jeff A. Benner, <em>Ancient Hebrew Language and Alphabet</em>.
              </div>
            </div>

            {/* Criticisms section - balanced presentation */}
            <div className="pt-3 border-t border-[var(--pw-border)]">
              <div className="font-medium text-[var(--pw-text)] mb-2">Common Criticisms of Pictographic Interpretation</div>

              <div className="space-y-2 text-xs text-[var(--pw-text-faint)]">
                <div>
                  <span className="font-medium text-[var(--pw-text)]">Historical &amp; Linguistic Concerns:</span> Many biblical linguists and Semitic scholars argue that while the letters did originate as pictographs in Proto-Sinaitic script (circa 1800–1500 BC), by the time of the biblical authors the script had become largely abstract. There is limited direct evidence that the writers of Scripture deliberately used the visual “picture” meanings as a layer of exegesis.<sup><a href="https://en.wikipedia.org/wiki/Proto-Sinaitic_script" target="_blank" className="text-[var(--pw-link)] hover:underline">[1]</a></sup><sup><a href="https://www.biblearchaeology.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[5]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Subjectivity &amp; Eisegesis Risk:</span> Different teachers assign different meanings to the same letter (e.g., Aleph as “ox/strength” vs. “leader/God”). Critics note that this can lead to highly subjective readings that are difficult to verify or falsify from the text itself.<sup><a href="https://www.ancient-hebrew.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[2]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Lack of Ancient Attestation:</span> Unlike clear examples of typology or numerics within the biblical text itself, there are no explicit statements in Scripture saying “the shape of the letter means X.” Some see this as an extra-biblical framework being read back into the text.<sup><a href="https://www.biblearchaeology.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[5]</a></sup>
                </div>

                <div>
                  <span className="font-medium text-[var(--pw-text)]">Scholarly Consensus:</span> Most academic Hebrew lexicographers (e.g., those behind BDB, HALOT, or modern grammars) derive word meanings from comparative Semitic linguistics, usage within the corpus, and context — not from pictographic form. They generally treat pictographic approaches as devotional or homiletical rather than exegetically rigorous.<sup><a href="https://www.biblearchaeology.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">[5]</a></sup>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-[var(--pw-text-faint)]">
                These critiques are important to consider. Chuck Missler himself often presented multiple perspectives and encouraged listeners to “eat the meat and spit out the bones.” Many who appreciate pictographic studies still hold them as supplementary insights that must remain subordinate to the plain text and sound hermeneutics.
              </div>
            </div>

            <p className="italic text-[var(--pw-accent-gold)]/80">
              “The Bible is a book that is 6000 years old… and yet it’s more up to date than tomorrow’s newspaper.”<br />
              — Chuck Missler
            </p>

            <div className="mt-4 text-xs">
              <div className="font-medium text-[var(--pw-text)] mb-1">Explore more from Chuck Missler:</div>
              <div>
                <a href="https://www.khouse.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">Koinonia House</a> (khouse.org) —{' '}
                <a href="https://www.youtube.com/@koinoniahouse" target="_blank" className="text-[var(--pw-link)] hover:underline">YouTube Channel</a>
              </div>
            </div>

            <p className="text-[10px] text-[var(--pw-text-faint)]">
              These perspectives are presented here in the same spirit Chuck modeled: not to create division, but to provoke wonder. Sincere students of the Word have held different emphases throughout history. The goal is to love the text more deeply — because every letter truly is God-breathed.
            </p>

            <div className="mt-4 pt-2 border-t border-[var(--pw-border)] text-[10px] text-[var(--pw-text-faint)]">
              <div className="font-medium mb-1 text-[var(--pw-text)]">References</div>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Proto-Sinaitic script origins: <a href="https://en.wikipedia.org/wiki/Proto-Sinaitic_script" target="_blank" className="text-[var(--pw-link)] hover:underline">Wikipedia / scholarly summaries</a></li>
                <li>Jeff A. Benner, <em>Ancient Hebrew Language and Alphabet</em>; <a href="https://www.ancient-hebrew.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">ancient-hebrew.org</a></li>
                <li>Chuck Missler teachings — <a href="https://www.khouse.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">Koinonia House</a> (khouse.org) and YouTube</li>
                <li>2 Timothy 3:16 (KJV)</li>
                <li>Bible Archaeology resources: <a href="https://www.biblearchaeology.org/" target="_blank" className="text-[var(--pw-link)] hover:underline">Associates for Biblical Research</a></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
