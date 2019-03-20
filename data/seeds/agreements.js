exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("agreements")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("agreements").insert([
        {
          offer_id: 84,
          affiliate_id: 462,
          advertiser_id: 425,
          clicks: 274393,
          impressions: 396556
        },
        {
          offer_id: 55,
          affiliate_id: 179,
          advertiser_id: 151,
          clicks: 736320,
          impressions: 276723
        },
        {
          offer_id: 20,
          affiliate_id: 106,
          advertiser_id: 227,
          clicks: 309261,
          impressions: 9294
        },
        {
          offer_id: 68,
          affiliate_id: 219,
          advertiser_id: 375,
          clicks: 854350,
          impressions: 147673
        },
        {
          offer_id: 61,
          affiliate_id: 358,
          advertiser_id: 384,
          clicks: 819846,
          impressions: 949644
        },
        {
          offer_id: 9,
          affiliate_id: 342,
          advertiser_id: 45,
          clicks: 697617,
          impressions: 685379
        },
        {
          offer_id: 82,
          affiliate_id: 102,
          advertiser_id: 346,
          clicks: 62292,
          impressions: 566932
        },
        {
          offer_id: 25,
          affiliate_id: 85,
          advertiser_id: 185,
          clicks: 716760,
          impressions: 479573
        },
        {
          offer_id: 91,
          affiliate_id: 244,
          advertiser_id: 290,
          clicks: 266340,
          impressions: 569442
        },
        {
          offer_id: 59,
          affiliate_id: 191,
          advertiser_id: 67,
          clicks: 393797,
          impressions: 280278
        },
        {
          offer_id: 88,
          affiliate_id: 406,
          advertiser_id: 2,
          clicks: 261458,
          impressions: 670858
        },
        {
          offer_id: 50,
          affiliate_id: 141,
          advertiser_id: 239,
          clicks: 270783,
          impressions: 944822
        },
        {
          offer_id: 50,
          affiliate_id: 288,
          advertiser_id: 447,
          clicks: 617845,
          impressions: 347709
        },
        {
          offer_id: 28,
          affiliate_id: 274,
          advertiser_id: 363,
          clicks: 959882,
          impressions: 739410
        },
        {
          offer_id: 94,
          affiliate_id: 388,
          advertiser_id: 183,
          clicks: 316878,
          impressions: 652761
        },
        {
          offer_id: 18,
          affiliate_id: 429,
          advertiser_id: 419,
          clicks: 50094,
          impressions: 932773
        },
        {
          offer_id: 100,
          affiliate_id: 409,
          advertiser_id: 157,
          clicks: 12289,
          impressions: 871010
        },
        {
          offer_id: 1,
          affiliate_id: 211,
          advertiser_id: 219,
          clicks: 84819,
          impressions: 260595
        },
        {
          offer_id: 7,
          affiliate_id: 224,
          advertiser_id: 333,
          clicks: 590688,
          impressions: 509483
        },
        {
          offer_id: 68,
          affiliate_id: 1,
          advertiser_id: 46,
          clicks: 675546,
          impressions: 804608
        },
        {
          offer_id: 68,
          affiliate_id: 4,
          advertiser_id: 439,
          clicks: 510378,
          impressions: 173992
        },
        {
          offer_id: 97,
          affiliate_id: 43,
          advertiser_id: 430,
          clicks: 198499,
          impressions: 394925
        },
        {
          offer_id: 71,
          affiliate_id: 103,
          advertiser_id: 163,
          clicks: 512440,
          impressions: 514648
        },
        {
          offer_id: 40,
          affiliate_id: 208,
          advertiser_id: 105,
          clicks: 729142,
          impressions: 685725
        },
        {
          offer_id: 49,
          affiliate_id: 344,
          advertiser_id: 196,
          clicks: 492606,
          impressions: 137952
        },
        {
          offer_id: 11,
          affiliate_id: 231,
          advertiser_id: 288,
          clicks: 74801,
          impressions: 854076
        },
        {
          offer_id: 32,
          affiliate_id: 34,
          advertiser_id: 199,
          clicks: 1141,
          impressions: 803140
        },
        {
          offer_id: 77,
          affiliate_id: 251,
          advertiser_id: 188,
          clicks: 930580,
          impressions: 383323
        },
        {
          offer_id: 47,
          affiliate_id: 489,
          advertiser_id: 4,
          clicks: 187372,
          impressions: 725508
        },
        {
          offer_id: 29,
          affiliate_id: 105,
          advertiser_id: 151,
          clicks: 124904,
          impressions: 245372
        },
        {
          offer_id: 63,
          affiliate_id: 221,
          advertiser_id: 351,
          clicks: 614141,
          impressions: 124187
        },
        {
          offer_id: 40,
          affiliate_id: 370,
          advertiser_id: 379,
          clicks: 923635,
          impressions: 789957
        },
        {
          offer_id: 57,
          affiliate_id: 372,
          advertiser_id: 67,
          clicks: 432182,
          impressions: 170477
        },
        {
          offer_id: 65,
          affiliate_id: 202,
          advertiser_id: 222,
          clicks: 769493,
          impressions: 545437
        },
        {
          offer_id: 20,
          affiliate_id: 194,
          advertiser_id: 288,
          clicks: 263789,
          impressions: 289400
        },
        {
          offer_id: 31,
          affiliate_id: 109,
          advertiser_id: 448,
          clicks: 638096,
          impressions: 621889
        },
        {
          offer_id: 91,
          affiliate_id: 16,
          advertiser_id: 66,
          clicks: 933194,
          impressions: 923249
        },
        {
          offer_id: 99,
          affiliate_id: 87,
          advertiser_id: 77,
          clicks: 599290,
          impressions: 481530
        },
        {
          offer_id: 64,
          affiliate_id: 450,
          advertiser_id: 32,
          clicks: 493450,
          impressions: 988219
        },
        {
          offer_id: 3,
          affiliate_id: 270,
          advertiser_id: 179,
          clicks: 535161,
          impressions: 948414
        },
        {
          offer_id: 77,
          affiliate_id: 433,
          advertiser_id: 164,
          clicks: 173291,
          impressions: 810358
        },
        {
          offer_id: 58,
          affiliate_id: 126,
          advertiser_id: 399,
          clicks: 304167,
          impressions: 610281
        },
        {
          offer_id: 84,
          affiliate_id: 66,
          advertiser_id: 42,
          clicks: 568991,
          impressions: 605636
        },
        {
          offer_id: 59,
          affiliate_id: 146,
          advertiser_id: 92,
          clicks: 196088,
          impressions: 679292
        },
        {
          offer_id: 50,
          affiliate_id: 421,
          advertiser_id: 436,
          clicks: 736657,
          impressions: 51190
        },
        {
          offer_id: 92,
          affiliate_id: 293,
          advertiser_id: 168,
          clicks: 52185,
          impressions: 78662
        },
        {
          offer_id: 33,
          affiliate_id: 265,
          advertiser_id: 350,
          clicks: 164094,
          impressions: 625788
        },
        {
          offer_id: 92,
          affiliate_id: 140,
          advertiser_id: 167,
          clicks: 356191,
          impressions: 365457
        },
        {
          offer_id: 27,
          affiliate_id: 123,
          advertiser_id: 445,
          clicks: 519136,
          impressions: 202045
        },
        {
          offer_id: 12,
          affiliate_id: 326,
          advertiser_id: 101,
          clicks: 621827,
          impressions: 671985
        },
        {
          offer_id: 94,
          affiliate_id: 247,
          advertiser_id: 184,
          clicks: 666409,
          impressions: 944411
        },
        {
          offer_id: 95,
          affiliate_id: 389,
          advertiser_id: 8,
          clicks: 219987,
          impressions: 644601
        },
        {
          offer_id: 8,
          affiliate_id: 468,
          advertiser_id: 437,
          clicks: 475641,
          impressions: 116383
        },
        {
          offer_id: 100,
          affiliate_id: 384,
          advertiser_id: 22,
          clicks: 818863,
          impressions: 957243
        },
        {
          offer_id: 6,
          affiliate_id: 309,
          advertiser_id: 319,
          clicks: 724221,
          impressions: 65607
        },
        {
          offer_id: 92,
          affiliate_id: 235,
          advertiser_id: 82,
          clicks: 946504,
          impressions: 795634
        },
        {
          offer_id: 16,
          affiliate_id: 315,
          advertiser_id: 451,
          clicks: 856103,
          impressions: 573880
        },
        {
          offer_id: 59,
          affiliate_id: 64,
          advertiser_id: 26,
          clicks: 701399,
          impressions: 277300
        },
        {
          offer_id: 25,
          affiliate_id: 498,
          advertiser_id: 44,
          clicks: 857319,
          impressions: 520366
        },
        {
          offer_id: 87,
          affiliate_id: 90,
          advertiser_id: 332,
          clicks: 560753,
          impressions: 507906
        },
        {
          offer_id: 42,
          affiliate_id: 489,
          advertiser_id: 370,
          clicks: 141936,
          impressions: 959033
        },
        {
          offer_id: 48,
          affiliate_id: 269,
          advertiser_id: 399,
          clicks: 496168,
          impressions: 444177
        },
        {
          offer_id: 97,
          affiliate_id: 381,
          advertiser_id: 295,
          clicks: 949208,
          impressions: 784115
        },
        {
          offer_id: 44,
          affiliate_id: 84,
          advertiser_id: 37,
          clicks: 69493,
          impressions: 912361
        },
        {
          offer_id: 77,
          affiliate_id: 150,
          advertiser_id: 328,
          clicks: 504932,
          impressions: 415022
        },
        {
          offer_id: 53,
          affiliate_id: 189,
          advertiser_id: 237,
          clicks: 668189,
          impressions: 195463
        },
        {
          offer_id: 42,
          affiliate_id: 263,
          advertiser_id: 375,
          clicks: 786274,
          impressions: 977482
        },
        {
          offer_id: 84,
          affiliate_id: 84,
          advertiser_id: 421,
          clicks: 586575,
          impressions: 516808
        },
        {
          offer_id: 53,
          affiliate_id: 205,
          advertiser_id: 469,
          clicks: 826878,
          impressions: 638923
        },
        {
          offer_id: 87,
          affiliate_id: 191,
          advertiser_id: 0,
          clicks: 323673,
          impressions: 21573
        },
        {
          offer_id: 67,
          affiliate_id: 375,
          advertiser_id: 56,
          clicks: 420020,
          impressions: 823224
        },
        {
          offer_id: 39,
          affiliate_id: 238,
          advertiser_id: 349,
          clicks: 321422,
          impressions: 689200
        },
        {
          offer_id: 21,
          affiliate_id: 241,
          advertiser_id: 368,
          clicks: 711482,
          impressions: 721237
        },
        {
          offer_id: 70,
          affiliate_id: 399,
          advertiser_id: 344,
          clicks: 140481,
          impressions: 980729
        },
        {
          offer_id: 43,
          affiliate_id: 244,
          advertiser_id: 73,
          clicks: 452670,
          impressions: 405160
        },
        {
          offer_id: 52,
          affiliate_id: 461,
          advertiser_id: 7,
          clicks: 647750,
          impressions: 692279
        },
        {
          offer_id: 17,
          affiliate_id: 130,
          advertiser_id: 194,
          clicks: 215332,
          impressions: 197044
        },
        {
          offer_id: 7,
          affiliate_id: 367,
          advertiser_id: 324,
          clicks: 94526,
          impressions: 956710
        },
        {
          offer_id: 38,
          affiliate_id: 373,
          advertiser_id: 295,
          clicks: 644273,
          impressions: 216327
        },
        {
          offer_id: 92,
          affiliate_id: 369,
          advertiser_id: 142,
          clicks: 593732,
          impressions: 674231
        },
        {
          offer_id: 25,
          affiliate_id: 155,
          advertiser_id: 402,
          clicks: 849770,
          impressions: 730411
        },
        {
          offer_id: 88,
          affiliate_id: 87,
          advertiser_id: 287,
          clicks: 520174,
          impressions: 557549
        },
        {
          offer_id: 19,
          affiliate_id: 270,
          advertiser_id: 407,
          clicks: 90413,
          impressions: 340485
        },
        {
          offer_id: 69,
          affiliate_id: 294,
          advertiser_id: 64,
          clicks: 885856,
          impressions: 715913
        },
        {
          offer_id: 72,
          affiliate_id: 435,
          advertiser_id: 295,
          clicks: 729198,
          impressions: 221248
        },
        {
          offer_id: 56,
          affiliate_id: 230,
          advertiser_id: 223,
          clicks: 861167,
          impressions: 230083
        },
        {
          offer_id: 35,
          affiliate_id: 455,
          advertiser_id: 88,
          clicks: 853623,
          impressions: 362774
        },
        {
          offer_id: 74,
          affiliate_id: 178,
          advertiser_id: 441,
          clicks: 276944,
          impressions: 646422
        },
        {
          offer_id: 5,
          affiliate_id: 128,
          advertiser_id: 141,
          clicks: 350259,
          impressions: 622739
        },
        {
          offer_id: 48,
          affiliate_id: 54,
          advertiser_id: 130,
          clicks: 295243,
          impressions: 882632
        },
        {
          offer_id: 71,
          affiliate_id: 111,
          advertiser_id: 352,
          clicks: 183148,
          impressions: 28899
        },
        {
          offer_id: 41,
          affiliate_id: 238,
          advertiser_id: 398,
          clicks: 295769,
          impressions: 934623
        },
        {
          offer_id: 50,
          affiliate_id: 141,
          advertiser_id: 48,
          clicks: 9717,
          impressions: 627035
        },
        {
          offer_id: 15,
          affiliate_id: 122,
          advertiser_id: 122,
          clicks: 453311,
          impressions: 963505
        },
        {
          offer_id: 63,
          affiliate_id: 236,
          advertiser_id: 296,
          clicks: 873521,
          impressions: 909151
        },
        {
          offer_id: 91,
          affiliate_id: 178,
          advertiser_id: 302,
          clicks: 13362,
          impressions: 131621
        },
        {
          offer_id: 76,
          affiliate_id: 3,
          advertiser_id: 432,
          clicks: 969443,
          impressions: 8229
        },
        {
          offer_id: 76,
          affiliate_id: 270,
          advertiser_id: 290,
          clicks: 323285,
          impressions: 675885
        },
        {
          offer_id: 78,
          affiliate_id: 21,
          advertiser_id: 96,
          clicks: 586429,
          impressions: 53662
        },
        {
          offer_id: 77,
          affiliate_id: 326,
          advertiser_id: 334,
          clicks: 799489,
          impressions: 430258
        }
      ]);
    });
};
