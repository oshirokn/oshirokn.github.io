function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Story data storage - will be populated from JSON files
let storyData = {};
let currentStory = null;
let readingProgress = { storyId: null, scrollProgress: 0 };

// Function to load story data from JSON files
async function loadStoryData(storyId) {
  try {
    const response = await fetch(`stories/${storyId}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    storyData[storyId] = data;
    return data;
  } catch (error) {
    console.error('Error loading story data:', error);
    return null;
  }
}

async function showStory(storyId) {
  // Load story data if not already loaded
  if (!storyData[storyId]) {
    const data = await loadStoryData(storyId);
    if (!data) {
      alert('Error loading story data');
      return;
    }
  }
  
  currentStory = storyData[storyId];
  if (!currentStory) return;

  // Set up download links with simplified naming convention
  if (currentStory.downloads) {
    const pdfDownload = document.getElementById('pdf-preview-download');
    const epubDownload = document.getElementById('epub-preview-download');
    
    if (currentStory.type === 'short' || currentStory.free === true) {
      // For short stories and free stories, these are the complete files
      pdfDownload.href = currentStory.downloads.pdf;
      epubDownload.href = currentStory.downloads.epub;
      pdfDownload.download = `${currentStory.title}.pdf`;
      epubDownload.download = `${currentStory.title}.epub`;
      pdfDownload.textContent = 'FULL PDF';
      epubDownload.textContent = 'FULL EPUB';
    } else {
      // For longer works, these are preview files
      pdfDownload.href = currentStory.downloads.pdf;
      epubDownload.href = currentStory.downloads.epub;
      pdfDownload.download = `${currentStory.title}_Preview.pdf`;
      epubDownload.download = `${currentStory.title}_Preview.epub`;
      pdfDownload.textContent = 'PREVIEW PDF';
      epubDownload.textContent = 'PREVIEW EPUB';
    }
  }

  // Handle purchase/newsletter sections based on story type
  const purchaseSection = document.getElementById('archive-access-section');
  const newsletterSection = document.getElementById('newsletter-signup-section');
  
  if (currentStory.free === true) {
    // Show newsletter signup instead of purchase section for free stories
    purchaseSection.style.display = 'none';
    newsletterSection.style.display = 'block';
  } else if (currentStory.type !== 'short') {
    // Show purchase section for paid longer works
    purchaseSection.style.display = 'block';
    newsletterSection.style.display = 'none';
    
    const directAccessBtn = document.getElementById('direct-access-btn');
    const retailAccessBtn = document.getElementById('retail-access-btn');
    const statusMessage = document.getElementById('status-message');
    
    // Set story status and handle buttons accordingly
    const status = currentStory.status || 'under_review';
    const statusBadge = document.getElementById('story-status');
    
    switch(status) {
      case 'available':
        statusBadge.textContent = 'AVAILABLE';
        statusBadge.style.color = 'var(--accent-green)';
        statusMessage.style.display = 'none';
        
        // Enable buttons with actual links
        directAccessBtn.disabled = false;
        retailAccessBtn.disabled = false;
        directAccessBtn.classList.remove('disabled');
        retailAccessBtn.classList.remove('disabled');
        
        if (currentStory.purchase_links) {
          directAccessBtn.onclick = () => window.open(currentStory.purchase_links.bookfunnel, '_blank');
          retailAccessBtn.onclick = () => window.open(currentStory.purchase_links.retail, '_blank');
        }
        break;
        
      case 'under_review':
      default:
        statusBadge.textContent = 'UNDER REVIEW';
        statusBadge.style.color = 'var(--accent-amber)';
        statusMessage.textContent = 'Document undergoing final verification and review process. Access will be enabled upon completion.';
        statusMessage.style.display = 'block';
        
        // Keep buttons disabled
        directAccessBtn.disabled = true;
        retailAccessBtn.disabled = true;
        directAccessBtn.classList.add('disabled');
        retailAccessBtn.classList.add('disabled');
        break;
        
      case 'coming_soon':
        statusBadge.textContent = 'COMING SOON';
        statusBadge.style.color = 'var(--accent-cyan)';
        statusMessage.textContent = 'Document processing complete. Archive access will be available soon.';
        statusMessage.style.display = 'block';
        
        directAccessBtn.disabled = true;
        retailAccessBtn.disabled = true;
        directAccessBtn.classList.add('disabled');
        retailAccessBtn.classList.add('disabled');
        break;
        
      case 'wip':
        statusBadge.textContent = 'SIMULATION ACTIVE';
        statusBadge.style.color = 'var(--accent-cyan)';
        statusMessage.textContent = 'Simulation currently underway. Document will be available upon completion of experimental parameters.';
        statusMessage.style.display = 'block';
        
        directAccessBtn.disabled = true;
        retailAccessBtn.disabled = true;
        directAccessBtn.classList.add('disabled');
        retailAccessBtn.classList.add('disabled');
        break;
    }

    // Populate document specifications
    document.getElementById('word-count').textContent = currentStory.word_count || '--';
    document.getElementById('page-count').textContent = currentStory.pages || '--';
    
    // Set price
    document.getElementById('story-price').textContent = currentStory.price || '--';
  } else {
    // Hide both sections for short stories
    purchaseSection.style.display = 'none';
    newsletterSection.style.display = 'none';
  }

  // Show/hide and update sections based on story type
  const previewSection = document.querySelector('.preview-section');
  
  if (currentStory.type === 'short') {
    // Update preview section for full story access
    const previewHeader = previewSection.querySelector('h3');
    const previewLevel = previewSection.querySelector('.preview-level');
    const previewDescription = previewSection.querySelector('.preview-description');
    const previewInstructions = previewSection.querySelector('.preview-instructions');
    
    previewHeader.textContent = 'Complete Story Access';
    previewLevel.textContent = 'FULL DOCUMENT';
    previewDescription.innerHTML = '<span class="preview-icon">→</span>Complete story available for immediate access';
    previewInstructions.textContent = 'Access the complete story through download or web reader below.';
    
  } else if (currentStory.free === true) {
    // Update preview section for free lead magnet
    const previewHeader = previewSection.querySelector('h3');
    const previewLevel = previewSection.querySelector('.preview-level');
    const previewDescription = previewSection.querySelector('.preview-description');
    const previewInstructions = previewSection.querySelector('.preview-instructions');
    
    previewHeader.textContent = 'Document Preview';
    previewLevel.textContent = 'DOCUMENT PREVIEW';
    previewDescription.innerHTML = '<span class="preview-icon">👁</span>Preview available - Complete document delivered via transmission protocol above';
    previewInstructions.textContent = 'Sample opening sequence before initializing transmission protocol.';
    
  } else {
    // Reset preview section for preview mode
    const previewHeader = previewSection.querySelector('h3');
    const previewLevel = previewSection.querySelector('.preview-level');
    const previewDescription = previewSection.querySelector('.preview-description');
    const previewInstructions = previewSection.querySelector('.preview-instructions');
    
    previewHeader.textContent = 'Document Preview';
    previewLevel.textContent = 'DOCUMENT PREVIEW';
    previewDescription.innerHTML = '<span class="preview-icon">👁</span>Preview includes: Opening sequence (first chapters)';
    previewInstructions.textContent = 'Access preview content through download or web reader below.';
  }

  loadReadingProgress(storyId);

  document.getElementById('story-classification').textContent = currentStory.classification;
  document.getElementById('story-title-main').textContent = currentStory.title;
  document.getElementById('story-description-full').innerHTML = currentStory.description;

  const coverContainer = document.getElementById('story-cover-container');
  if (currentStory.cover) {
    coverContainer.innerHTML = '<img src="' + currentStory.cover + '" alt="' + currentStory.title + '" class="story-cover">';
  } else {
    coverContainer.innerHTML = '<div class="story-cover-placeholder">COVER PENDING<br>RECOVERY</div>';
  }

  const tagsContainer = document.getElementById('story-tags');
  tagsContainer.innerHTML = currentStory.tags.map(function(tag) {
    let className = 'genre-tag';
    if (tag.includes('+')) className = 'age-rating';
    if (tag.includes('Violence') || tag.includes('Sexual')) className = 'content-warnings';
    if (tag.includes('min') || tag.includes('hour')) className = 'reading-time';
    return '<span class="' + className + '">[' + tag + ']</span>';
  }).join('');

  setupReadingArea(storyId);

  document.getElementById('reading-area').classList.remove('active');
  document.getElementById('web-reading-btn').classList.remove('active');
  if (currentStory.type === 'short') {
    document.getElementById('web-reading-btn').textContent = 'Read Story';
  } else {
    document.getElementById('web-reading-btn').textContent = 'Read Preview';
  }

  showPage('story');
}

function setupReadingArea(storyId) {
  const sidebar = document.getElementById('chapter-sidebar');
  
  // All stories now use the simple progress system
  sidebar.innerHTML = `
    <h3>Reading Progress</h3>
    <div class="reading-progress">
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      <div class="progress-text" id="progress-text">0% complete</div>
    </div>
    ${currentStory.type !== 'short' && currentStory.free !== true ? `
      <div class="preview-notice">
        <h4>Preview Mode</h4>
        <p>Fragment from recovered archives.</p>
        <p>Full preview accessible through download verification above.</p>
      </div>
    ` : ''}
    ${currentStory.free === true ? `
      <div class="preview-notice">
        <h4>Preview Mode</h4>
        <p>Sample from recovered archives.</p>
        <p>Complete document delivered via transmission protocol above.</p>
      </div>
    ` : ''}
  `;
  
  // Hide chapter navigation if it exists - not needed anymore
  const chapterNav = document.getElementById('chapter-navigation');
  if (chapterNav) {
    chapterNav.style.display = 'none';
  }
}

function toggleWebReading() {
  const readingArea = document.getElementById('reading-area');
  const toggleBtn = document.getElementById('web-reading-btn');

  if (readingArea.classList.contains('active')) {
    readingArea.classList.remove('active');
    toggleBtn.classList.remove('active');
    // Set appropriate text based on story type
    if (currentStory.type === 'short') {
      toggleBtn.textContent = 'Read Story';
    } else {
      toggleBtn.textContent = 'Read Preview';
    }
  } else {
    readingArea.classList.add('active');
    toggleBtn.classList.add('active');
    toggleBtn.textContent = 'Close Reader';
    
    // Reset progress to 0% when opening reader
    readingProgress.scrollProgress = 0;
    updateProgress();
    
    loadStoryContent();
  }
}

function loadStoryContent() {
  // Load the content directly
  const chapterContent = document.getElementById('chapter-content');
  
  // Clear any existing content and classes
  chapterContent.innerHTML = '';
  chapterContent.className = '';
  
  // Add the story content and class
  chapterContent.innerHTML = currentStory.content;
  chapterContent.classList.add('story-content');
  
  // Force a reflow to ensure styles are applied
  chapterContent.offsetHeight;
  
  updateProgress();
}

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  if (progressFill && progressText) {
    const progress = Math.round(readingProgress.scrollProgress * 100);
    progressFill.style.width = progress + '%';
    progressText.textContent = progress + '% complete';
  }
}

function saveReadingProgress() {
  if (currentStory && readingProgress.storyId) {
    readingProgress.lastAccess = new Date().toISOString();
    localStorage.setItem('reading_progress_' + readingProgress.storyId, JSON.stringify(readingProgress));
  }
}

function loadReadingProgress(storyId) {
  const saved = localStorage.getItem('reading_progress_' + storyId);
  if (saved) {
    readingProgress = JSON.parse(saved);
  } else {
    readingProgress = {
      storyId: storyId,
      scrollProgress: 0,
      lastAccess: new Date().toISOString()
    };
  }
}

function showPage(pageId) {
  if (pageId === 'story') {
    document.querySelectorAll('.page-section').forEach(function(page) {
      page.classList.remove('active');
    });

    document.querySelectorAll('.nav-links a').forEach(function(link) {
      link.classList.remove('active');
    });

    setTimeout(function() {
      document.getElementById('page-story').classList.add('active');
    }, 50);

    // Always show the footer
    const footer = document.querySelector('.archive-reconstruction');
    if (footer) {
      footer.style.display = 'block';
    }

    return;
  }

  document.querySelectorAll('.page-section').forEach(function(page) {
    page.classList.remove('active');
  });

  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.classList.remove('active');
  });

  setTimeout(function() {
    document.getElementById('page-' + pageId).classList.add('active');
  }, 50);

  if (pageId !== 'story') {
    document.getElementById('nav-' + pageId).classList.add('active');
  }

  // Always show the footer
  const footer = document.querySelector('.archive-reconstruction');
  if (footer) {
    footer.style.display = 'block';
  }
}

// Make entire book cards clickable
document.addEventListener('DOMContentLoaded', function() {
  showPage('home');

  // Get all book cards and make them clickable
  const bookCards = document.querySelectorAll('.book-card');
  
  bookCards.forEach(card => {
    // Find the access button within this card
    const accessButton = card.querySelector('.access-button');
    
    if (accessButton) {
      // Get the onclick function from the button
      const onclickAttr = accessButton.getAttribute('onclick');
      const href = accessButton.getAttribute('href');
      
      // Make the entire card clickable only if it's not disabled
      if (accessButton.style.cursor !== 'not-allowed' && 
          !accessButton.classList.contains('disabled') &&
          accessButton.textContent !== 'Irrecoverable' &&
          accessButton.textContent !== 'Recovery Pending' &&
          accessButton.textContent !== 'Deep Archive') {
        
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
          // Prevent triggering if clicking on the button itself (avoid double-trigger)
          if (e.target === accessButton) {
            return;
          }
          
          // Execute the same action as the button
          if (onclickAttr) {
            // Execute the onclick function
            eval(onclickAttr);
          } else if (href && href !== '#') {
            // Navigate to the href
            window.location.href = href;
          }
        });
      }
    }
  });

  // Scroll progress tracking for all stories
  window.addEventListener('scroll', function() {
    if (currentStory && document.getElementById('reading-area').classList.contains('active')) {
      const content = document.getElementById('chapter-content');
      const readingArea = document.getElementById('reading-area');
      
      if (content && readingArea) {
        // Get the reading area's position relative to the viewport
        const readingAreaRect = readingArea.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        
        // Calculate how much of the content has been scrolled past
        const contentTop = contentRect.top;
        const contentHeight = contentRect.height;
        const viewportHeight = window.innerHeight;
        
        // Progress starts when content enters viewport, completes when it exits
        let scrollPercent = 0;
        
        if (contentTop <= 0 && contentHeight + contentTop > 0) {
          // Content is in viewport - calculate progress based on how much has scrolled past
          const scrolledPast = Math.abs(contentTop);
          const totalScrollableHeight = contentHeight - viewportHeight;
          
          if (totalScrollableHeight > 0) {
            scrollPercent = Math.min(Math.max(scrolledPast / totalScrollableHeight, 0), 1);
          } else {
            // Content is shorter than viewport - consider it 100% read when visible
            scrollPercent = contentTop <= 0 ? 1 : 0;
          }
        } else if (contentTop < 0) {
          // Content has scrolled completely past
          scrollPercent = 1;
        }

        readingProgress.scrollProgress = scrollPercent;
        updateProgress();
        
        if (scrollPercent > 0) {
          saveReadingProgress();
        }
      }
    }
  });
});