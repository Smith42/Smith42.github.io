# 80TB+ of astronomy for the HDD-poor:<br>crossmatch the Multimodal Universe from your laptop

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/64bfce50484eccec034222a4/xePDi3wtskYvdODKpDaug.png" width="63%">
</p>

## TL;DR

The [Multimodal Universe](https://arxiv.org/abs/2412.02527) (MMU) pools together  80TB<sup><a id="fnref1" href="#fn1">1</a></sup> plus of data from over 30 astronomical surveys into one place. Crossmatching (linking observations of the same object across surveys) is its killer feature, but until now it required downloading hefty chunks of data to local disk. We got tired of needing a cluster just to run a crossmatch, so we gathered in the [UniverseTBD](https://discord.gg/rhBJQgSXcV) and [Hugging Science](https://discord.gg/caqxB63DPd) Discord servers to fix that. We've converted the MMU to the parquet-based [HATS](https://hats.readthedocs.io/) format so that you can use the [LSDB](https://lsdb.io/) and Hugging Face ecosystems to crossmatch from a laptop. The datasets are [in this Hugging Face collection](https://huggingface.co/collections/UniverseTBD/multimodal-universe-hats). No bulk downloads are necessary, and 4GB of RAM is enough even at Gaia scale. Here it is in action:

<script src="https://asciinema.org/a/1259218.js" id="asciicast-1259218" async data-theme="asciinema" data-idle-time-limit="2"></script>

That whole run ☝️ is really just this 👇:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["lsdb", "huggingface-hub"]
# ///
import lsdb

gz10 = lsdb.open_catalog("hf://datasets/UniverseTBD/mmu_gz10")
sdss = lsdb.open_catalog("hf://datasets/UniverseTBD/mmu_sdss_sdss")

xmatch = gz10.crossmatch(sdss, n_neighbors=1).compute()
```

## What exactly is the Multimodal Universe?

<p align="center">
  <img src="https://huggingface.co/datasets/Smith42/blogpost-pictures/resolve/main/mmu.png" width="80%">
  <em>The MMU in a nutshell.<br>CREDIT: MMU Collaboration (2024)</em>
</p>

The MMU is what happens when a bunch of astronomers from a bunch of institutes get tired of every survey having its own quirks and decide to put everything in one format that non-astronomers can use easily. We're talking about over 80TB of galaxy imagery taken across the spectrum, spectra of galaxies and stars, time series of variable stars, and a whole zoo of assorted measurements and physical data. The idea is simple: you shouldn't need a PhD in a specific survey's archival system to load the data from that survey and do cool science with it.

In astronomy, data is abundant yet fragmented; it's out there, but every survey does things a little differently. Different storage formats, different documentation, and different gotchas (like one survey storing brightness as magnitudes and another as flux in Janskys) that you need to be familiar with to get the most out of it. The MMU standardises all of this, and provides a nice crossmatching utility on top so that you can link objects across surveys to build your own multimodal datasets.

There is a big catch though. In the MMU v1.0, crossmatching requires you to download data in its native HDF5 format. Even for a subset of the full MMU this is a significant chunk of space. The individual datasets stream beautifully from Hugging Face, but the moment you want to combine them (which is the whole point!) you need local storage that is just out of reach for many astronomers. This means that the MMU's most powerful feature is not usable by those of us that have computers that are more potato than Ferrari.

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/64bfce50484eccec034222a4/9yBdaDtFGpjZz6iUNWgYo.png" width="63%">
  <em>A freshly avoidable issue.</em>
</p>

So we fixed it. We converted the individual MMU datasets from their old HDF5 format into HATS, and uploaded them to Hugging Face. The LSDB folks had already built streaming crossmatching into their library, and once the data was in the right format and in the right place, it just worked. We'll get to that shortly, but first let's discuss why crossmatching is worth all this trouble.

## Why should you care about crossmatching astronomy data?

Crossmatching is the process of saying "this image, this spectrum, and this photometry are descriptions of this object". In astronomy you do this by tracking where in the sky each survey is looking, recording that location, and then calling two observations "the same thing" if they are close enough together. This is a simple enough process in principle, but a real nightmare when you try to do it at scale.

So what does crossmatching look like in practice for astronomers and what science does it enable? A great example is documented within the paper "[Luminous Late-time Radio Emission from Supernovae Detected by the Karl G. Jansky Very Large Array Sky Survey (VLASS)](https://arxiv.org/abs/2106.09737)" by Michael Stroh and others. They took ~70k examples of previously found supernovae, crossmatched their sample with the VLASS radio survey, and then filtered candidates over the Chandra, LOFAR, XMM-Newton, and Swift-XRT surveys. This whittled down 70,000 candidates to just 19 supernovae.

Each of these remnants was weirdly still pumping out radio radiation many years after its explosion. Normally a supernova's radio emission fades predictably as the shock wave plows through the relatively thin gas surrounding the dying star. Stroh and friends proposed three explanations for this. The shock wave may have slammed into a dense shell of material that the star shed into space centuries before it exploded. The radio emission might be coming from a jet of material (similar to those seen in gamma-ray bursts) that was initially pointing away from Earth and has only now swung into view as it slowed. Or the explosion may have left behind a rapidly spinning neutron star whose energetic winds are lighting up the surrounding debris. None of those candidates could have been identified without crossmatching across five surveys.

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/64bfce50484eccec034222a4/SgpWxqMih8JadaOdPG7pw.jpeg" width="63%">
  <em>Everyone knows Plato throws the best parties.</em>
</p>

Astronomical crossmatching is also a key ingredient in testing one of the spiciest ideas in modern ML: the [Platonic Representation Hypothesis](https://arxiv.org/abs/2405.07987) (PRH). The PRH says that neural nets trained on different data with different objectives are converging on the same picture of reality; a shared statistical model of the world, like Plato's ideal Forms casting shadows on the cave wall. Astronomy is a great place to test this hypothesis as galaxy images, spectra, photometry, and other measurements can be thought of as different "shadows" cast by the same underlying physics. If the PRH holds up, we'd expect bigger neural networks to represent the same astronomical object in increasingly similar ways, independent of the instrument that captured it.

This is exactly what the "[Platonic Universe](https://arxiv.org/abs/2509.19453)" project is testing. The team used MMU crossmatches (pairing Hyper Suprime Cam imagery with Legacy Survey and JWST optical and infrared imagery, as well as with DESI spectra) within a one arcsecond radius (roughly the width of a human hair viewed ten metres away). They compared the internal representations of vision transformers, self-supervised models, and astronomy-specific architectures like [AstroPT](https://arxiv.org/abs/2405.14930) and [Specformer](https://arxiv.org/abs/2310.03024). And they found that as the models got larger, their embedding space similarity increased. The same galaxy ends up in roughly the same neighborhood across models: models trained on entirely different datasets really do seem to be converging towards some kind of shared "Platonic" representation space.

The upshot is that astronomy may be able to piggyback on the huge investments the open source machine learning community has already made by repurposing and finetuning general-purpose off-the-shelf foundation models instead of pre-training from scratch. And none of this analysis would have been possible without crossmatched data; without being able to say "this image, this spectrum, and these physical properties all describe the same galaxy".

These studies showcase the kind of science that the Multimodal Universe is designed to make easy. But actually performing these crossmatches has required downloading sizable chunks of the MMU (or other data) to local disk. So how do we fix that?

## HATS + LSDB ❤️  Hugging Face 🤗

We've teamed up with LINCC Frameworks to convert the MMU into HATS. HATS is the catalogue format behind LSDB, their Python library for chewing through petabyte-scale astro surveys.

<p align="center">
  <img src="https://huggingface.co/datasets/Smith42/blogpost-pictures/resolve/main/gaia.webp" width="63%">
  <em>Gaia DR3 dataset partitioned through the Hierarchical Adaptive Tiling Scheme.<br>CREDIT: LINCC Frameworks.</em>
</p>

The HATS dataset format divides the sky into "HEALPix" (Hierarchical Equal Area isoLatitude Pixelisation) tiles. These are equally-spaced subdivisions of a sphere, where each pixel covers the same surface area as the other pixels at the same level. In HATS, each HEALPix is stored in a separate Apache Parquet file, and the sky is divided so that dense regions get smaller HEALPix tiles, and sparse regions get larger ones. This all means that we keep the number of objects roughly equal within each tile, and don't end up with very large, unwieldy `*.parquet` files. This is great for streaming as we only need to hold one matching pair of tiles in memory at a time! And – thanks to the dynamic tiling that HATS introduces – these tiles have a small enough memory footprint to fit nicely into your laptop's RAM. You never need to hold the whole dataset on disk at once.

Under the hood, LSDB compares the two catalogues' HATS partition maps to identify overlapping tile pairs. For each pair, it loads just those two Parquet files and runs a KD-tree spatial match within a specified angular radius. Because only overlapping tiles are ever loaded, huge swathes of sky that don't appear in both catalogues are skipped entirely. Dask parallelises across tile pairs, and everything is lazy: calling `crossmatch()` builds a task graph, but nothing happens until you say go.

The `CatalogStream` interface is what makes this laptop-friendly. Instead of materialising the entire crossmatch result in memory, it yields one partition at a time with background pre-fetching. In our [benchmarks](https://github.com/UniverseTBD/hats-crossmatch-benchmark), crossmatching the 18k-object Galaxy Zoo 10 catalogue against the 800k-object SDSS catalogue at a 1 arcsecond radius used only 4 GB when streamed. And streaming the full crossmatch took less than 20 minutes, with the first batch of results arriving in under 4 seconds. Which is great for rapid iteration as you can start inspecting matches almost immediately. Scaling up to SDSS vs Gaia (800k crossmatched against 122M objects) kept peak memory at around 4GB. The dataset got 150x bigger, but the memory needed didn't budge.

## Just give me the code examples! 🗣️


<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/64bfce50484eccec034222a4/H3kmjmq4thwPtZXXeSGZf.png" width="74%">
  🤗 <code>datasets</code><em> and </em><code>CatalogStream</code><em> to the rescue.</em>
</p>

Hugging Face is a great fit for hosting the _MMU x HATS_ datasets, as HATS uses Apache Parquet which HF natively supports. This means that no special infrastructure is needed, everything works nicely out of the box. More than this, we can natively leverage the Hugging Face Datasets and LSDB ecosystems!

This means that streaming an astro dataset in the MMU is as easy as using the Hugging Face Datasets stack you already know and love:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["datasets", "pillow"]
# ///
"""Stream an MMU dataset via Hugging Face Datasets."""
from datasets import load_dataset

gz10 = load_dataset("UniverseTBD/mmu_gz10", split="train", streaming=True)
print(next(iter(gz10)))
```

```
{'_healpix_29': 318719439679484682, 'rgb_image': <PIL.PngImagePlugin.PngImageFile image mode=RGB size=256x256 at 0x11359FB60>, 'gz10_label': 7, 'redshift': 0.058778468519449234, 'rgb_pixel_scale': 0.2619999945163727, 'ra': 141.71510314941406, 'dec': 20.576555252075195, 'object_id': '13024'}
```

And if you want to take advantage of the crossmatching and streaming capabilities of [LSDB](https://docs.lsdb.io/en/stable/#), you can:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["lsdb", "huggingface-hub", "matplotlib", "pillow"]
# ///
"""Crossmatch two HATS catalogs and stream the result."""
import io
import lsdb
import matplotlib.pyplot as plt
from PIL import Image
from lsdb.streams import CatalogStream

# do the crossmatch
gz10 = lsdb.open_catalog("hf://datasets/UniverseTBD/mmu_gz10")
sdss = lsdb.open_catalog("hf://datasets/UniverseTBD/mmu_sdss_sdss")
xmatch = gz10.crossmatch(sdss, n_neighbors=1)
rows = next(iter(CatalogStream(catalog=xmatch))).head(4)

# plot the crossmatch
fig, ax = plt.subplots(2, 4, figsize=(8, 4), sharex="row", sharey="row")
for i, (_, row) in enumerate(rows.iterrows()):
    ax[0, i].imshow(Image.open(io.BytesIO(row["rgb_image_mmu_gz10"]["bytes"])))
    ax[0, i].set_xticks([]); ax[0, i].set_yticks([])
    spec = row["spectrum_mmu_sdss_sdss"][~row["spectrum_mmu_sdss_sdss"]["mask"]]
    ax[1, i].plot(spec["lambda"], spec["flux"], color="hotpink")
    ax[1, i].set_xlabel("wavelength [Å]")
ax[1, 0].set_ylabel("flux")
plt.show()
```

<p align="center">
  <img src="https://cdn-uploads.huggingface.co/production/uploads/64bfce50484eccec034222a4/EwddUKj9lshRnbuKk2hHZ.png" width="80%">
</p>

You also inherit all the spatial-operation goodies that LSDB specialises in. We show this off in a separate [tutorial](https://github.com/AstroAI-CfA/tutorial-lsdb) and [Hugging Face Space](https://huggingface.co/spaces/TobiasPitters/mmu-crossmatch), do check these out if you want to dive deeper!

The whole of Multimodal Universe v1.0 is now on Hugging Face in HATS format as MMUv1.5 (you can browse the collection [here](https://huggingface.co/collections/UniverseTBD/multimodal-universe-hats)). And we'd love help growing it. If you have astronomical data that isn’t in the MMU yet, the [`hats-import`](https://hats-import.readthedocs.io/en/stable/) library makes it easy to convert your data to HATS and upload it to Hugging Face so that everyone can crossmatch against it. If you’re looking for a multimodal playground, the full MMU is waiting: grab a couple surveys, crossmatch them in a few lines of code and see what your models can learn when they get imagery, spectra, and photometry of the same objects.

We built this because the MMU's most powerful feature was locked behind hardware most people don't have. Crossmatching surveys was something you did if you were at the right institution, on the right cluster, with the right credentials, and with the right storage budget. Now it's something you can do on your creaky Thinkpad. If you've ever wanted to do real astronomy and assumed you couldn't, you (yes 🫵!) can. Pick two surveys, run the four lines at the top of this post, and come tell us what you found or made in the  [Hugging Science](https://discord.gg/caqxB63DPd) or [UniverseTBD Discord](https://discord.gg/rhBJQgSXcV)!

### Acknowledgements
 
Thanks to everyone who made this happen.

To our dataset contributors, who did the critical work of converting catalogues to HATS and verifying them against the originals: Tobias Pitters, Tom Hehir, rai, George Vassilakis, and Matthieu Le Lain. Thanks to Micaela Perillo and Thomás Busso for preparing the dataset cards.

To the LINCC Frameworks team for HATS and LSDB and for invaluable help with the conversion and streaming: Neven Caplar, Kostya Malanchev, Doug Branton, and Melissa DeLucchi.

A huge shout out to Martin Hardcastle and the University of Hertfordshire HPC team for crucial compute and infra support.

To Cecilia Garraffo, Rafael Martínez-Galarza, and the AstroAI group at the Harvard-Smithsonian Center for Astrophysics for incubating and supporting this project from the start. To Rodrigo Fernando Díaz, Steven Dillmann, John Wu, Josh Speagle, Miles Cranmer, Marc Huertas-Company, and François Lanusse for support, and to Ioana Ciucă for co-organisation. To Quentin Lhoest and Georgia Channing at Hugging Face: Quentin for his guidance on the Datasets library, and Georgia for championing this work and securing the hosting that made the multi-terabyte uploads possible. And to the AstroAI, Hugging Science, Multimodal Universe, and UniverseTBD collaborations and communities for the underlying dataset and for making a home for this work.

---

<a id="fn1"></a>
<sup>1</sup> The eagle-eyed reader may have noticed that MMU v1.0 boasted "100TB" of astro-data, but here we state 80TB. This is because MaNGA's zero-padded data cubes compressed _beautifully_ under HATS + Parquet + Xet. <a href="#fnref1">↩</a> 
